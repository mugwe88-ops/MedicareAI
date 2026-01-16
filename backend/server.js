const express = require("express");
const axios = require("axios");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));


// --- 🛡️ SECURITY ---
app.use(helmet()); 
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later."
});
app.use("/webhook", limiter);

// --- ⚙️ CONFIG ---
const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

// --- 🏠 ROUTES ---

// Health Check
app.get("/", (req, res) => {
  res.status(200).send({ status: "Online", service: "MedicareAI", time: new Date() });
});

// WhatsApp Webhook Verification
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook Verified!");
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

// Main Message Handler
app.post("/webhook", async (req, res) => {
  try {
    const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (message?.text?.body) {
      const from = message.from;
      const userText = message.text.body;

      console.log(`📩 Message from ${from}: ${userText}`);

      // NEXT STEP: This is where we will call Gemini AI
      const aiResponse = `MedicareAI Bot: I received "${userText}". How can I help you today?`;
      
      await sendWhatsApp(from, aiResponse);
    }
    res.sendStatus(200);
  } catch (err) {
    console.error("🔥 Error:", err.message);
    res.sendStatus(500);
  }
});

// --- 📨 SEND FUNCTION ---
async function sendWhatsApp(to, text) {
  try {
    await axios.post(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
      messaging_product: "whatsapp",
      to: to,
      text: { body: text },
    }, {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` }
    });
    console.log(`📤 Reply sent to ${to}`);
  } catch (e) {
    console.error("❌ Send Fail:", e.response?.data || e.message);
  }
}

app.listen(PORT, () => console.log(`🚀 MedicareAI Active on Port ${PORT}`));
