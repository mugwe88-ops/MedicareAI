import express from "express";
import axios from "axios";

const router = express.Router();

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "medicare_secret_2026";
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

/**
 * 1. Webhook Verification (GET)
 * This handles Meta's handshake to keep the connection alive.
 */
router.get("/", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified by Meta");
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

/**
 * 2. Message Handling (POST)
 * This handles actual incoming text messages from patients.
 */
router.post("/", async (req, res) => {
  try {
    const body = req.body;

    // Check if this is a WhatsApp message event
    if (body.object === "whatsapp_business_account") {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const message = value?.messages?.[0];

      if (message && message.type === "text") {
        const patientNumber = message.from; // Patient's WhatsApp ID
        const patientText = message.text.body;

        console.log(`📩 Message from ${patientNumber}: ${patientText}`);

        // --- CONSULTANT LOGIC ---
        // For now, we simulate that the consultant is always busy.
        // Later, you can link this to a real database or Google Calendar.
        const isConsultantBusy = true; 

        if (isConsultantBusy) {
          const aiReply = "Hello! I am the Medicare AI Assistant. The consultant is currently in a session. Would you like me to send you a booking link so you can schedule a time to speak later?";
          
          await sendWhatsAppMessage(patientNumber, aiReply);
        }
      }
      return res.status(200).send("EVENT_RECEIVED");
    } else {
      return res.sendStatus(404);
    }
  } catch (error) {
    console.error("❌ Error processing webhook:", error.message);
    res.sendStatus(500);
  }
});

/**
 * Helper function to send messages back to WhatsApp
 */
async function sendWhatsAppMessage(to, text) {
  try {
    await axios({
      method: "POST",
      url: `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      data: {
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: { body: text },
      },
    });
    console.log("📤 Reply sent to patient!");
  } catch (error) {
    console.error("❌ Failed to send WhatsApp message:", error.response?.data || error.message);
  }
}

export default router;