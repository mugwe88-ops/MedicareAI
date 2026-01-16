require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const express = require("express");

const app = express();
app.use(bodyParser.json());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("MedicareAI backend is running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const axios = require("axios");

async function sendWhatsAppMessage(to, message) {
  const url = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

  await axios.post(
    url,
    {
      messaging_product: "whatsapp",
      to,
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

// WhatsApp webhook verification
app.get("/webhook", (req, res) => {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === verifyToken) {
    console.log("✅ WhatsApp webhook verified");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});
// Receive WhatsApp messages
app.post("/webhook", (req, res) => {
  const entry = req.body.entry?.[0];
  const changes = entry?.changes?.[0];
  const value = changes?.value;
  const messages = value?.messages;

  if (messages && messages.length > 0) {
    const message = messages[0];
    const from = message.from; // patient's phone
    const text = message.text?.body;

    console.log("📩 Message from:", from);
    console.log("💬 Text:", text);
  }

  res.sendStatus(200);
});

if (messages && messages.length > 0) {
  const message = messages[0];
  const from = message.from;
  const text = message.text?.body;

  console.log("📩", from, text);

  sendWhatsAppMessage(
    from,
    "👋 Welcome to MedicareAI.\n\nPlease reply with:\n1️⃣ Book appointment\n2️⃣ Services\n3️⃣ Talk to clinic"
  );
}
