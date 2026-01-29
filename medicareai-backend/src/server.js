import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import pool, { initDb } from './db.js';
import { verifyWhatsAppSignature } from "./verifyWhatsAppSignature.js";
import { sendMessage } from './services/whatsappService.js';
import { logMessageToDb } from './lib/messageLogger.js';
import { getDoctors, getAvailableSlots, updateSession, getSession } from './services/bookingService.js';
import * as mpesaService from './services/mpesa.service.js';

const app = express();
const PORT = process.env.PORT || 10000;
const JWT_SECRET = process.env.JWT_SECRET || 'medicare_super_secret_key_2024';
const API_URL = 'https://medicareai-4av2.onrender.com';

const API_URL = 'https://medicareai-backend.onrender.com'; // Use your actual Render URL

document.querySelector('.continue-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    
    const doctorData = {
        name: document.querySelector('input[placeholder="Willy Weyru"]').value,
        specialty: document.querySelector('input[placeholder="lab"]').value,
        fee: document.querySelector('input[placeholder="1500"]').value,
        phone: document.querySelector('input[placeholder="+254723503988"]').value,
        email: document.querySelector('input[placeholder="mugwe88@gmail.com"]').value,
        password: document.querySelector('input[type="password"]').value
    };

    try {
        // 1. Initial Signup (Status: PENDING)
        const response = await fetch(`${API_URL}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(doctorData)
        });

        if (response.ok) {
            // 2. Show OTP Modal
            document.getElementById('otpModal').style.display = 'flex';
        } else {
            alert("Signup failed. Check if email/phone already exists.");
        }
    } catch (err) {
        console.error("Error connecting to server:", err);
    }
});
app.use(cors());
app.use(express.json({ verify: (req, res, buf) => { req.rawBody = buf; } }));

// Middleware to protect Doctor routes
const authenticateDoctor = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(403).json({ error: "No token provided." });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.doctorId = decoded.doctorId;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized access." });
  }
};

/* ============================
   1. DOCTOR AUTH & DASHBOARD
============================ */

// Register a new Doctor Profile
app.post('/api/doctors/register', async (req, res) => {
  const { name, specialty, phone_number, email, password, fee } = req.body;
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO doctors (name, specialty, phone_number, email, password_hash, consultation_fee) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name`,
      [name, specialty, phone_number, email, passwordHash, fee]
    );
    res.status(201).json({ message: "Doctor profile created!", doctor: result.rows[0] });
  } catch (err) {
    res.status(400).json({ error: "Email or Phone already exists." });
  }
});

// Login for Doctors
app.post('/api/doctors/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM doctors WHERE email = $1', [email]);
    if (result.rowCount === 0) return res.status(401).json({ error: "Invalid credentials." });
    
    const doctor = result.rows[0];
    const isMatch = await bcrypt.compare(password, doctor.password_hash);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials." });

    const token = jwt.sign({ doctorId: doctor.id, name: doctor.name }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, doctor: { id: doctor.id, name: doctor.name } });
  } catch (err) {
    res.status(500).json({ error: "Login failed." });
  }
});

// Get Doctor Queue
app.get('/api/doctor/dashboard', authenticateDoctor, async (req, res) => {
  try {
    const queue = await pool.query(`
      SELECT a.id, a.patient_phone, v.start_time, a.status
      FROM appointments a
      JOIN availability v ON a.slot_id = v.id
      WHERE a.doctor_id = $1 AND v.available_date = CURRENT_DATE AND a.payment_status = 'COMPLETED'
      ORDER BY v.start_time ASC
    `, [req.doctorId]);
    res.json(queue.rows);
  } catch (err) {
    res.status(500).json({ error: "Queue fetch failed." });
  }
});
app.post('/api/appointments/no-show', authenticateDoctor, async (req, res) => {
  const { appointmentId } = req.body;
  try {
    await pool.query(
      "UPDATE appointments SET status = 'NO_SHOW' WHERE id = $1 AND doctor_id = $2", 
      [appointmentId, req.doctorId]
    );
    res.json({ message: "Recorded as No-Show." });
  } catch (err) {
    res.status(500).json({ error: "Failed to update status." });
  }
});

//'complete' route to also ensure doctor security
app.post('/api/appointments/complete', authenticateDoctor, async (req, res) => {
  const { appointmentId } = req.body;
  try {
    await pool.query(
      "UPDATE appointments SET status = 'COMPLETED' WHERE id = $1 AND doctor_id = $2", 
      [appointmentId, req.doctorId]
    );
    res.json({ message: "Patient seen and cleared." });
  } catch (err) {
    res.status(500).json({ error: "Failed to update status." });
  }
});

/* ============================
   2. WHATSAPP WEBHOOK
============================ */

app.post('/webhook', verifyWhatsAppSignature, async (req, res) => {
  try {
    const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    res.sendStatus(200);
    if (!message || message.type !== 'text') return;

    const from = message.from;
    const text = message.text.body.trim().toLowerCase();
    let session = await getSession(from);
    let replyText = "";

    if (text.includes('book') || text === 'hi') {
      const doctors = await getDoctors();
      replyText = "🏥 *MedicareAI Booking*\nSelect a doctor by replying with their ID:\n\n";
      doctors.forEach(dr => replyText += `*${dr.id}*: ${dr.name} (${dr.specialty})\nFee: KES ${dr.consultation_fee}\n\n`);
      await updateSession(from, 'SELECTING_DOCTOR');

    } else if (session?.current_step === 'SELECTING_DOCTOR') {
      const doctorId = parseInt(text);
      const slots = await getAvailableSlots(doctorId);
      if (slots.length > 0) {
        replyText = `📅 *Slots for Dr. ${slots[0].doctor_name}:*\nReply with Slot ID:\n\n`;
        slots.forEach(s => replyText += `*${s.id}*: ${s.available_date} at ${s.start_time}\n`);
        await updateSession(from, 'SELECTING_SLOT', { selectedDoctorId: doctorId });
      } else {
        replyText = "❌ No slots found. Type 'book' to restart.";
      }

    } else if (session?.current_step === 'SELECTING_SLOT') {
      const slotId = parseInt(text);
      const drRes = await pool.query('SELECT name, consultation_fee FROM doctors WHERE id = $1', [session.metadata.selectedDoctorId]);
      const doctor = drRes.rows[0];

      const mpesa = await mpesaService.initiateSTKPush(from, doctor.consultation_fee, `Slot-${slotId}`);
      if (mpesa.ResponseCode === "0") {
        await pool.query('INSERT INTO appointments (patient_phone, doctor_id, slot_id, checkout_request_id) VALUES ($1,$2,$3,$4)', 
          [from, session.metadata.selectedDoctorId, slotId, mpesa.CheckoutRequestID]);
        replyText = `💸 *M-Pesa Prompt Sent*\nEnter PIN to pay KES ${doctor.consultation_fee} for Dr. ${doctor.name}.`;
        await updateSession(from, 'AWAITING_PAYMENT');
      } else {
        replyText = "❌ Payment failed to initiate.";
      }
    }
    if (replyText) await sendMessage(from, replyText);
  } catch (err) { console.error('Webhook Error:', err); }
});

/* ============================
   3. MPESA CALLBACK
============================ */

app.post('/mpesa-callback', async (req, res) => {
  const stkCallback = req.body?.Body?.stkCallback;
  res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
  if (!stkCallback || stkCallback.ResultCode !== 0) return;

  const receipt = stkCallback.CallbackMetadata.Item.find(i => i.Name === 'MpesaReceiptNumber')?.Value;
  const checkoutID = stkCallback.CheckoutRequestID;

  const update = await pool.query(`
    UPDATE appointments SET payment_status = 'COMPLETED', mpesa_receipt = $1 
    WHERE checkout_request_id = $2 RETURNING slot_id, patient_phone
  `, [receipt, checkoutID]);

  if (update.rowCount > 0) {
    await pool.query('UPDATE availability SET is_booked = TRUE WHERE id = $1', [update.rows[0].slot_id]);
    await sendMessage(update.rows[0].patient_phone, `✅ *Booking Confirmed!*\nReceipt: ${receipt}\nSee you soon!`);
  }
});

// Start Server
app.listen(PORT, '0.0.0.0', async () => {
  await initDb();
  console.log('🟢 MedicareAI System Online');
});
