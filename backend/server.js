import 'dotenv/config'; // Loads .env immediately at the top
import express from 'express';
import axios from 'axios';

// IMPORTANT: Once we integrate the database, you will add this line:
// import { prisma } from '../src/lib/prisma.js'; 

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 10000;

// ENV VARIABLES
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

// ---- STARTUP LOGS ----
console.log("🚀 MedicareAI starting (ESM Mode)...");
console.log("VERIFY_TOKEN loaded:", VERIFY_TOKEN ? "✅ YES" : "❌ NO");
console.log("WHATSAPP_TOKEN loaded:", WHATSAPP_TOKEN ? "✅ YES" : "❌ NO");
console.log("PHONE_NUMBER_ID loaded:", PHONE_NUMBER_ID ? "✅ YES" : "❌ NO");

// ---- WEBHOOK VERIFICATION ----
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified successfully");
    return res.status(200).send(challenge);
  }

  console.log("❌ Webhook verification failed");
  return res.sendStatus(403);
});

// ---- RECEIVE WHATSAPP MESSAGES ----
app.post("/webhook", async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (!message) {
      return res.sendStatus(200);
    }

    const from = message.from;
    const text = message.text?.body;

    console.log("📩 Incoming message:", text, "from", from);

    // ---- SEND REPLY ----
    await axios.post(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: from,
        text: { body: "👋 Hello! MedicareAI is online and standardized." },
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Reply sent");
    res.sendStatus(200);
  } catch (error) {
    console.error(
      "❌ Error:",
      error.response?.data || error.message
    );
    res.sendStatus(500);
  }
});

// ---- START SERVER ----
app.listen(PORT, () => {
  console.log(`🟢 MedicareAI active on port ${PORT}`);
});