import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import axios from 'axios';

import pool from './db.js';
import { buildAutoReply } from './services/autoReply.js';

/* ============================
   APP INIT
============================ */
const app = express();
const PORT = process.env.PORT || 10000;

/* ============================
   MIDDLEWARE
============================ */
app.use(cors());
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

/* ============================
   HEALTH CHECK
============================ */
app.get('/', (req, res) => {
  res.status(200).send('🟢 MedicareAI API is Live');
});

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================
   META WEBHOOK VERIFY (GET)
============================ */
app.get('/api/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
    console.log('✅ Webhook verified');
    return res.status(200).send(challenge);
  }

  console.log('❌ Webhook verification failed');
  return res.sendStatus(403);
});

/* ============================
   META WEBHOOK RECEIVE (POST)
   DRY-RUN AUTO-REPLY ENGINE
============================ */
app.post('/api/webhook', (req, res) => {
  console.log('📩 INCOMING WHATSAPP EVENT');

  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];

    // Ignore non-message events (delivery receipts, etc.)
    if (!message) {
      console.log('ℹ️ No message found (status update)');
      return res.sendStatus(200);
    }

    const from = message.from;
    const text = message.text?.body;

    console.log('👤 From:', from);
    console.log('💬 Message:', text);

    // DRY-RUN AUTO-REPLY (NO META SEND)
    const reply = buildAutoReply(text);

    if (reply) {
      console.log('🤖 AUTO-REPLY (DRY RUN):', reply);
    } else {
      console.log('ℹ️ No reply generated');
    }

  } catch (err) {
    console.error('❌ Webhook parse error:', err.message);
  }

  // Always ACK Meta
  res.sendStatus(200);
});

/* ============================
   START SERVER (RENDER SAFE)
============================ */
app.listen(PORT, '0.0.0.0', () => {
  console.log('--------------------------------');
  console.log('🟢 MedicareAI Server is LIVE');
  console.log(`📍 Port: ${PORT}`);
  console.log('🔔 Webhooks: ENABLED');
  console.log('--------------------------------');
});
