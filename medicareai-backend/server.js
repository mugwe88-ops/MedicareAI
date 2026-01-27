/* ============================
   ENV & CORE IMPORTS
============================ */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import axios from 'axios';

/* ============================
   DATABASE (PostgreSQL + Prisma)
============================ */
import pkgPg from 'pg';
const { Pool } = pkgPg;

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

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
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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
app.get('/webhook', (req, res) => {
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verified by Meta');
    return res.status(200).send(challenge);
  }

  console.warn('❌ Webhook verification failed');
  return res.sendStatus(403);
});

/* ============================
   META WEBHOOK RECEIVE (POST)
============================ */
app.post('/webhook', async (req, res) => {
  try {
    console.log('📩 Incoming Webhook');
    console.log(JSON.stringify(req.body, null, 2));

    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (!message) {
      return res.sendStatus(200);
    }

    const from = message.from;
    const text = message.text?.body || '';

    console.log(`📨 Message from ${from}: ${text}`);

    // Auto-reply
    await axios.post(
      `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: from,
        text: {
          body:
            `👋 Hello! Welcome to *SWIFT MD*\n\n` +
            `Reply with:\n` +
            `1️⃣ Talk to a doctor\n` +
            `2️⃣ Book appointment\n` +
            `3️⃣ Get health advice`
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.sendStatus(200);
  } catch (err) {
    console.error('🔥 Webhook Error:', err.response?.data || err.message);
    res.sendStatus(200);
  }
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

