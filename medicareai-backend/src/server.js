import { pool } from './db.js';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * IMPORTANT:
 * We must capture RAW body for Meta signature verification
 */
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use(cors());

/**
 * HEALTH CHECK
 */
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * ROOT
 */
app.get('/', (req, res) => {
  res.send('SWIFT MD backend running');
});

/**
 * META WEBHOOK VERIFICATION (GET)
 */
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
    console.log('✅ Meta webhook verified');
    return res.status(200).send(challenge);
  }

  console.log('❌ Meta webhook verification failed');
  return res.sendStatus(403);
});

/**
 * META SIGNATURE VERIFICATION
 */
function verifyMetaSignature(req) {
  const signature = req.headers['x-hub-signature-256'];
  if (!signature || !req.rawBody) return false;

  const expected =
    'sha256=' +
    crypto
      .createHmac('sha256', process.env.META_APP_SECRET)
      .update(req.rawBody)
      .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

/**
 * META WEBHOOK EVENTS (POST)
 */
app.post('/webhook', async (req, res) => {
  if (!verifyMetaSignature(req)) {
    console.log('❌ Invalid Meta signature');
    return res.sendStatus(403);
  }

  const entry = req.body.entry?.[0];
  const change = entry?.changes?.[0];
  const value = change?.value;
  const message = value?.messages?.[0];

  if (!message || message.type !== 'text') {
    return res.sendStatus(200);
  }

  const from = message.from;
  const incomingText = message.text.body;
  const phoneNumberId = value.metadata.phone_number_id;

  console.log('📩 WhatsApp message:', from, incomingText);

  await sendWhatsAppReply(phoneNumberId, from, incomingText);

  res.sendStatus(200);
});

/**
 * SEND WHATSAPP AUTO-REPLY
 */
async function sendWhatsAppReply(phoneNumberId, to, incomingText) {
  const reply = incomingText.toLowerCase().includes('hello')
    ? '👋 Hi! Welcome to SWIFT MD. How can we help you today?'
    : 'Thanks for contacting SWIFT MD. A team member will respond shortly.';

  await axios.post(
    `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
    {
      messaging_product: 'whatsapp',
      to,
      text: { body: reply },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.META_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * START SERVER
 */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
