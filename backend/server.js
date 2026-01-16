require('dotenv').config();
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json()); // Built-in alternative to body-parser

// 1. Verification Logic (GET)
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === "subscribe" && token === verifyToken) {
    console.log("✅ Webhook Verified Successfully");
    // CRITICAL: Send the challenge back as a plain string
    return res.status(200).send(challenge);
  } else {
    console.error("❌ Verification failed. Token mismatch.");
    return res.sendStatus(403);
  }
});

// 2. Message Handling Logic (POST)
app.post("/webhook", async (req, res) => {
  const body = req.body;

  // Check if this is a WhatsApp event
  if (body.object === "whatsapp_business_account") {
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (messages && messages[0]) {
      const from = messages[0].from; 
      const text = messages[0].text?.body;

      console.log(`📩 Message from ${from}: ${text}`);

      // Auto-reply logic
      try {
        await sendWhatsAppMessage(
          from,
          "👋 Welcome to MedicareAI.\n\nPlease reply with:\n1️⃣ Book appointment\n2️⃣ Services\n3️⃣ Talk to clinic"
        );
      } catch (err) {
        console.error("Error sending message:", err.response?.data || err.message);
      }
    }
    return res.sendStatus(200);
  } else {
    return res.sendStatus(404);
  }
});

async function sendWhatsAppMessage(to, message) {
  const url = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  await axios.post(
    url,
    {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: message },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
}

app.get("/", (req, res) => res.send("MedicareAI backend is running"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));
