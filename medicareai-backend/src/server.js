import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import axios from 'axios';

// 1. Prisma 7 & Postgres Adapter Imports
import pkgPg from 'pg';
const { Pool } = pkgPg;
import pkgPrisma from '@prisma/client';
const { PrismaClient } = pkgPrisma;
import { PrismaPg } from '@prisma/adapter-pg';

// 2. Local Import (Matches your GitHub screenshot)
// Since both are in the root of medicareai-backend, use './'
import { encrypt, decrypt } from './encryption.js';

const app = express();
const PORT = process.env.PORT || 3000;

// 3. Middleware
app.use(cors());
app.use(express.json());

// 4. Database Connection Setup (Required for Cross-Region)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } 
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/* ===========================================================
   CORE LOGIC & ROUTES 
   (Paste your ~130 lines of M-Pesa/WhatsApp logic below)
   =========================================================== */

/* =========================
   HEALTH CHECK
========================= */
app.get('/', (req, res) => {
  res.status(200).send('MedicareAI backend running');
});

/* =========================
   WHATSAPP WEBHOOK VERIFY
========================= */
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

/* =========================
   WHATSAPP WEBHOOK RECEIVE
========================= */
app.post('/webhook', async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (!messages) {
      return res.sendStatus(200);
    }

    const message = messages[0];
    const from = message.from;
    const text = message.text?.body;

    if (!text) {
      return res.sendStatus(200);
    }

    console.log('Incoming message:', text);

    // TODO: your business logic here
    const reply = `Received: ${text}`;

    await axios.post(
      `https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: from,
        text: { body: reply }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.sendStatus(200);
  } catch (err) {
    console.error('Webhook error:', err);
    res.sendStatus(500);
  }
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
