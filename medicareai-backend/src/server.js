import pool from './db.js';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import axios from 'axios';

/* ============================
   
============================ */

/* ============================
   APP INIT
============================ */
const app = express();
const PORT = process.env.PORT || 10000;

/* ============================
   MIDDLEWARE
============================ */
app.use(cors());
app.use(express.json());

/* ============================
   DATABASE CONNECTION
============================ */

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
   ✅ STEP 4 — FIXED
============================ */
// Webhook verification (Meta GET)
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
============================ */
app.post('/api/webhook', (req, res) => {
  console.log('📩 INCOMING WHATSAPP EVENT');
  console.log(JSON.stringify(req.body, null, 2));
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

