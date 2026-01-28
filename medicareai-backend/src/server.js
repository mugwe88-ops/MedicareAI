import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pool from './db.js';
import { autoReplyDryRun } from './services/autoReply.js';
// FIXED: Only one import, using the correct middleware path
import { verifyWhatsAppSignature } from "./middleware/verifyWhatsAppSignature.js";

/* ============================
   CONFIG & IDEMPOTENCY
============================ */
const app = express();
const PORT = process.env.PORT || 10000;

// Simple memory cache to prevent duplicate processing from Meta retries
const processedMessageIds = new Set();
const CACHE_LIMIT = 500;

/* ============================
   MIDDLEWARE
============================ */
app.use(cors());
// Crucial: This rawBody parsing is required for signature verification
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

/* ============================
   HEALTH CHECKS
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
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
    console.log('✅ Webhook verified');
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

/* ============================
   META WEBHOOK RECEIVE (POST)
   AGENDA 1 HARDENING APPLIED
============================ */
app.post('/webhook', verifyWhatsAppSignature, async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];

    // 1. Immediate ACK (Stops Meta from retrying unnecessarily)
    res.sendStatus(200);

    // 2. FILTER: Ignore status updates (delivered/read receipts)
    if (value?.statuses) return;

    // 3. FILTER: Only process text messages
    if (!message || message.type !== 'text') {
      console.log(`[Webhook] Ignored non-text type: ${message?.type || 'unknown'}`);
      return;
    }

    // 4. IDEMPOTENCY: Prevent double-processing
    if (processedMessageIds.has(message.id)) {
      console.log(`[Webhook] Duplicate message ID detected: ${message.id}. Skipping.`);
      return;
    }

    // Add to cache and prune if too large
    processedMessageIds.add(message.id);
    if (processedMessageIds.size > CACHE_LIMIT) {
      const oldestId = processedMessageIds.values().next().value;
      processedMessageIds.delete(oldestId);
    }

    // 5. DRY-RUN AUTO REPLY ENGINE
    const from = message.from;
    const text = message.text?.body || '';

    const reply = autoReplyDryRun({
      from,
      message: text
    });

    console.log(`[Dry-Run] From: ${from} | Text: "${text}" | Result:`, reply);

  } catch (err) {
    console.error('Webhook error:', err);
    // Already sent 200, so we just log the error here
  }
});

/* ============================
   START SERVER
============================ */
app.listen(PORT, '0.0.0.0', () => {
  console.log('--------------------------------');
  console.log('🟢 MedicareAI Server is LIVE');
  console.log(`📍 Port: ${PORT}`);
  console.log('🛡️ Webhook Hardening: ACTIVE');
  console.log('--------------------------------');
});