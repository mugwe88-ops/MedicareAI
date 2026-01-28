import axios from 'axios';

export const sendMessage = async (to, text) => {
  try {
    const url = `https://graph.facebook.com/${process.env.WHATSAPP_VERSION}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
    
    await axios.post(url, {
      messaging_product: "whatsapp",
      to: to,
      type: "text",
      text: { body: text }
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✉️ Message sent to ${to}`);
  } catch (error) {
    console.error('❌ WhatsApp Send Error:', error.response?.data || error.message);
  }
};
