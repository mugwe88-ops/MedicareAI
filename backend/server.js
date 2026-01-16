const express = require("express");
const axios = require("axios");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();

// --- 🛡️ SECURITY & MIDDLEWARE ---
app.use(helmet()); // Basic security headers
app.use(express.json()); // Parse incoming JSON

// Prevent spamming the webhook (100 requests per 15 mins)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later."
});
app.use("/webhook", limiter);

// --- ⚙️ CONFIGURATION ---
const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const VERSION = 'v18.0';

// --- 🏠 ROUTES ---

// 1. Health Check (Visual confirmation in browser)
app.get("/", (req, res) => {
  res.status(200).send({
    status: "Online",
    service: "MedicareAI Backend",
    timestamp: new Date().toISOString()
  });
});

// 2. Webhook Verification (For Meta setup)
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("✅ WEBHOOK_VERIFIED");
      return res.status(200).send(challenge);
    } else {
      console.error("❌ WEBHOOK_VERIFICATION_FAILED: Token mismatch");
      return res.sendStatus(403);
    }
  }
});

// 3. Main Message Handler
app.post("/webhook", async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (message) {
      const from = message.from; // User's phone number
      const msgBody = message.text?.body;

      console.log(`📩 Message from ${from}: "${msgBody}"`);

      // TODO: Integrate Gemini AI here later!
      // For now, let's just send a "Received" receipt
      await sendWhatsAppMessage(from, `MedicareAI received: "${msgBody}"`);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("🔥 Webhook Error:", err.message);
    res.sendStatus(500);
  }
});

// --- 📨 HELPER FUNCTIONS ---

async function sendWhatsAppMessage(to, text) {
  try {
    await axios({
      method: "POST",
      url: `https://graph.facebook.com/${VERSION}/${PHONE_NUMBER_ID}/messages`,
      data: {
        messaging_product: "whatsapp",
        to: to,
        text: { body: text },
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
    });
    console.log(`📤 Reply sent to ${to}`);
  } catch (error) {
    console.error("❌ Send Error:", error.response?.data || error.message);
  }
}

// --- 🚀 START SERVER ---
app.listen(PORT, () => {
  console.log(`
  --------------------------------------------------
  🚀 MedicareAI Server is Live!
  📡 URL: https://medicareai-4av2.onrender.com
  🔒 Port: ${PORT}
  --------------------------------------------------
  `);
});
