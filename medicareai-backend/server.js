import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pool, { initDb } from './db.js';
import { verifyWhatsAppSignature } from "./verifyWhatsAppSignature.js";
import { sendMessage } from './services/whatsappService.js';
import { logMessageToDb } from './lib/messageLogger.js';
import { getDoctors, getAvailableSlots, updateSession, getSession } from './services/bookingService.js';

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf; } }));

// Health Check
app.get('/', (req, res) => res.status(200).send('🟢 MedicareAI API is Live'));

// GET Webhook (Verification)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) return res.status(200).send(challenge);
  return res.sendStatus(403);
});

/* ============================
   WEBHOOK RECEIVE (POST)
============================ */
app.post('/webhook', verifyWhatsAppSignature, async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    // 1. Acknowledge Meta immediately
    res.sendStatus(200);

    if (value?.statuses || !message || message.type !== 'text') return;

    const from = message.from;
    const text = message.text.body.trim().toLowerCase();

    // 2. Fetch User Session
    let session = await getSession(from);
    let replyText = "";

    // 3. BOOKING FLOW LOGIC
    if (text.includes('book') || text === 'hi' || text === 'hello') {
      const doctors = await getDoctors();
      replyText = "🏥 *MedicareAI Booking*\nSelect a doctor by replying with their ID:\n\n";
      doctors.forEach(dr => {
        replyText += `*${dr.id}*: ${dr.name} (${dr.specialty})\nFee: KES ${dr.consultation_fee}\n\n`;
      });
      await updateSession(from, 'SELECTING_DOCTOR');

    } else if (session?.current_step === 'SELECTING_SLOT') {
      const slotId = parseInt(text);
      const doctorId = session.metadata.selectedDoctorId;

      // 1. Fetch doctor details to get the fee
      const drRes = await pool.query('SELECT name, consultation_fee FROM doctors WHERE id = $1', [doctorId]);
      const doctor = drRes.rows[0];

      if (!doctor) {
        await sendMessage(from, "❌ Error finding doctor details. Please type 'book' to restart.");
        return;
      }

      // 2. Trigger M-Pesa STK Push
      try {
        const mpesaResponse = await mpesaService.initiateSTKPush(from, doctor.consultation_fee, `Slot-${slotId}`);
        
        if (mpesaResponse.ResponseCode === "0") {
          // 3. SUCCESS: Save Pending Appointment with CheckoutRequestID
          await pool.query(`
            INSERT INTO appointments (patient_phone, doctor_id, slot_id, checkout_request_id, payment_status)
            VALUES ($1, $2, $3, $4, 'PENDING')
          `, [from, doctorId, slotId, mpesaResponse.CheckoutRequestID]);

          replyText = `💸 *M-Pesa Prompt Sent*\nPlease enter your PIN on your phone to pay KES ${doctor.consultation_fee} and confirm your booking with Dr. ${doctor.name}.`;
          await updateSession(from, 'AWAITING_PAYMENT', { checkoutRequestId: mpesaResponse.CheckoutRequestID });
        } else {
          throw new Error("M-Pesa initiation failed");
        }
      } catch (mpesaErr) {
        console.error("STK Push Error:", mpesaErr);
        replyText = "❌ Sorry, we couldn't initiate the payment prompt. Please try again later or check your phone number.";
      }
    // 4. Send Message & Log
    await sendMessage(from, replyText);
    await logMessageToDb({
      wamid: message.id,
      phoneNumber: from,
      text: text,
      intent: session?.current_step || 'START',
      reply: replyText
    });

  } catch (err) {
    console.error('❌ Webhook error:', err.message);
  }
});

app.listen(PORT, '0.0.0.0', async () => {
  await initDb();
  console.log('🟢 MedicareAI Server Live');
});
