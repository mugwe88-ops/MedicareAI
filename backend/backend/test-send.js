const axios = require('axios');
require('dotenv').config();

const sendTest = async () => {
  const url = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const data = {
    messaging_product: "whatsapp",
    to: "REPLACE_WITH_YOUR_PHONE_NUMBER", // e.g., "15551234567"
    type: "text",
    text: { body: "Hello from Gemini! Your MedicareAI bot is working! 🚀" }
  };

  try {
    const response = await axios.post(url, data, {
      headers: { Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}` }
    });
    console.log("✅ Message Sent!", response.data);
  } catch (error) {
    console.error("❌ Send Failed:", error.response ? error.response.data : error.message);
  }
};

sendTest();
