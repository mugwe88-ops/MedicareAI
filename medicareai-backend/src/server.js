import 'dotenv/config';
import express from 'express';
import axios from 'axios';
import pkg from 'pg';
const { Pool } = pkg;
import { encrypt, decrypt } from '../encryption.js';
import session from 'express-session';

const app = express();
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Database Initialization
async function initDatabase() {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS consultants (
            id SERIAL PRIMARY KEY,
            whatsapp_phone_id VARCHAR(255) UNIQUE NOT NULL,
            whatsapp_access_token TEXT NOT NULL,
            name VARCHAR(255) NOT NULL,
            booking_url TEXT NOT NULL,
            calendar_id VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
    await pool.query(createTableQuery);
}
initDatabase();

// 1. ONBOARDING API
app.post('/api/admin/onboard', async (req, res) => {
    try {
        const { whatsapp_phone_id, whatsapp_access_token, name, booking_url, calendar_id } = req.body;
        const secureToken = encrypt(whatsapp_access_token);
        const query = `
            INSERT INTO consultants (whatsapp_phone_id, whatsapp_access_token, name, booking_url, calendar_id)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (whatsapp_phone_id) DO UPDATE SET whatsapp_access_token = EXCLUDED.whatsapp_access_token, name = EXCLUDED.name
            RETURNING id, name;
        `;
        const result = await pool.query(query, [whatsapp_phone_id, secureToken, name, booking_url, calendar_id]);
        res.status(201).json({ message: "Consultant saved securely", data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
});

// 2. WEBHOOK VERIFICATION
app.get('/api/webhook', (req, res) => {
    const token = req.query['hub.verify_token'];
    if (token === process.env.VERIFY_TOKEN) return res.send(req.query['hub.challenge']);
    res.sendStatus(403);
});

// 3. DYNAMIC WEBHOOK PROCESSING
app.post('/api/webhook', async (req, res) => {
    // Acknowledge Meta quickly
    res.sendStatus(200);

    const body = req.body;
    if (!body.entry?.[0]?.changes?.[0]?.value?.messages) return;

    const message = body.entry[0].changes[0].value.messages[0];
    const phoneId = body.entry[0].changes[0].value.metadata.phone_number_id;
    const patientPhone = message.from;

    try {
        // Find consultant by phoneId
        const result = await pool.query('SELECT * FROM consultants WHERE whatsapp_phone_id = $1', [phoneId]);
        if (result.rows.length === 0) return console.log("Unknown Phone ID:", phoneId);

        const consultant = result.rows[0];
        const rawToken = decrypt(consultant.whatsapp_access_token);

        // Logic: Send reply based on interaction
        if (message.type === 'text') {
            await sendReply(phoneId, patientPhone, rawToken, `Hello! You are messaging ${consultant.name}. Click below to schedule.`, true);
        } else if (message.type === 'interactive' && message.interactive.button_reply.id === 'book_now') {
            await sendReply(phoneId, patientPhone, rawToken, `Great! Book here: ${consultant.booking_url}`, false);
        }
    } catch (err) {
        console.error("Webhook Logic Error:", err.message);
    }
});

// Helper Function: Send WhatsApp Messages
async function sendReply(phoneId, to, token, text, isButton) {
    const url = `https://graph.facebook.com/v18.0/${phoneId}/messages`;
    const data = isButton ? {
        messaging_product: "whatsapp", to, type: "interactive",
        interactive: {
            type: "button", body: { text },
            action: { buttons: [{ type: "reply", reply: { id: "book_now", title: "Book Now" } }] }
        }
    } : {
        messaging_product: "whatsapp", to, type: "text", text: { body: text }
    };

    await axios.post(url, data, { headers: { Authorization: `Bearer ${token}` } });
}

const PORT = process.env.PORT || 10000;
// 4. DATA VERIFICATION (Development Only)
app.get('/api/admin/consultants', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, whatsapp_phone_id, created_at FROM consultants');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.listen(PORT, () => console.log(`🟢 MedicareAI Live!`));