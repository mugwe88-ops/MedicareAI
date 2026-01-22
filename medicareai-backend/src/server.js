import dotenv from "dotenv";
dotenv.config();

import express from "express";
import axios from "axios";
import { Pool } from 'pg';
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { encrypt, decrypt } = require('./encryption');

const app = express();
app.use(express.json());

// 1. Database Connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // Ensure this is in your .env
    ssl: { rejectUnauthorized: false }
});

// ==========================================
// 2. ONBOARDING API (Add new consultants)
// ==========================================
app.post('/api/admin/onboard', async (req, res) => {
    const { whatsapp_phone_id, whatsapp_access_token, name, booking_url, calendar_id } = req.body;

    if (!whatsapp_phone_id || !whatsapp_access_token || !name) {
        return res.status(400).json({ error: "Missing required fields: phone_id, token, or name" });
    }

    try {
        // Encrypt the sensitive token before saving
        const secureToken = encrypt(whatsapp_access_token);

        const query = `
            INSERT INTO consultants (whatsapp_phone_id, whatsapp_access_token, name, booking_url, calendar_id)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (whatsapp_phone_id) DO UPDATE 
            SET whatsapp_access_token = EXCLUDED.whatsapp_access_token, 
                name = EXCLUDED.name, 
                booking_url = EXCLUDED.booking_url
            RETURNING id, name;
        `;
        
        const result = await pool.query(query, [whatsapp_phone_id, secureToken, name, booking_url, calendar_id]);
        res.status(201).json({ message: "Consultant saved securely", data: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
});

// ==========================================
// 3. WHATSAPP WEBHOOK (Handle messages)
// ==========================================

// Webhook Verification (Meta setup)
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token === process.env.VERIFY_TOKEN) {
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

// Main Webhook Logic
app.post('/webhook', async (req, res) => {
    // Acknowledge receipt immediately to Meta
    res.sendStatus(200);

    const body = req.body;
    if (!body.entry?.[0]?.changes?.[0]?.value?.messages) return;

    const message = body.entry[0].changes[0].value.messages[0];
    const phoneId = body.entry[0].changes[0].value.metadata.phone_number_id;
    const patientPhone = message.from;

    try {
        // Look up the consultant based on the ID WhatsApp sent us
        const consultantResult = await pool.query(
            'SELECT * FROM consultants WHERE whatsapp_phone_id = $1', 
            [phoneId]
        );

        if (consultantResult.rows.length === 0) return;

        const consultant = consultantResult.rows[0];
        // DECRYPT the token for use in the API call
        const decryptedToken = decrypt(consultant.whatsapp_access_token);

        // LOGIC: If user clicked 'book_now' button or sent first message
        if (message.type === 'text') {
            await sendBookingButton(phoneId, patientPhone, decryptedToken, consultant.name);
        } else if (message.type === 'interactive' && message.interactive.button_reply.id === 'book_now') {
            await sendLink(phoneId, patientPhone, decryptedToken, consultant.booking_url);
        }

    } catch (err) {
        console.error("Webhook Error:", err);
    }
});

// Helper: Send the initial Interactive Button
async function sendBookingButton(phoneId, to, token, name) {
    await axios.post(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
        messaging_product: "whatsapp",
        to: to,
        type: "interactive",
        interactive: {
            type: "button",
            body: { text: `Hello! You are messaging ${name}. Would you like to book an appointment?` },
            action: {
                buttons: [{ type: "reply", reply: { id: "book_now", title: "Book Now" } }]
            }
        }
    }, { headers: { Authorization: `Bearer ${token}` } });
}

// Helper: Send the Booking Link
async function sendLink(phoneId, to, token, url) {
    await axios.post(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: { body: `Great! You can book your slot here: ${url}` }
    }, { headers: { Authorization: `Bearer ${token}` } });
}

const PORT = process.env.PORT || 3000;
app.get("/health", (req, res) => {
  res.send("OK");
});

app.listen(PORT, () => console.log(`MedicareAI running on port ${PORT}`));