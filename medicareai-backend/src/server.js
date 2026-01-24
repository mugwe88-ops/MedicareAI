import 'dotenv/config';
import express from 'express';
import axios from 'axios';
import pkg from 'pg';
const { Pool } = pkg;
import { encrypt, decrypt } from '../encryption.js';

const app = express();
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// 1. SELF-HEALING DATABASE (Runs every time Render restarts)
async function initDatabase() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS consultants (
                id SERIAL PRIMARY KEY,
                name TEXT,
                whatsapp_phone_id TEXT UNIQUE,
                whatsapp_access_token TEXT,
                booking_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Grab values directly from your Render Environment Variables
        const token = process.env.WHATSAPP_ACCESS_TOKEN;
        const phoneId = "1013054165213912";

        if (token) {
            const encryptedToken = encrypt(token);
            await pool.query(`
                INSERT INTO consultants (name, whatsapp_phone_id, whatsapp_access_token, booking_url)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (whatsapp_phone_id) 
                DO UPDATE SET whatsapp_access_token = $3;
            `, ["Dr. House", phoneId, encryptedToken, "https://calendly.com/test"]);
            console.log("💎 Database Synced: Dr. House is locked in.");
        }
    } catch (err) {
        console.error("❌ DB Init Error:", err.message);
    }
}

// 2. SEND REPLY (v22.0)
async function sendReply(phoneId, to, token, text) {
    const cleanTo = to.replace('+', ''); 
    const url = `https://graph.facebook.com/v22.0/${phoneId}/messages`;
    
    const data = {
        messaging_product: "whatsapp",
        to: cleanTo,
        type: "text",
        text: { body: text }
    };

    try {
        await axios.post(url, data, { 
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            } 
        });
        console.log(`✅ Message sent successfully to ${cleanTo}`);
    } catch (err) {
        // Detailed error logging to catch any Meta permission issues
        console.error("❌ Meta API Error:", err.response?.data || err.message);
    }
}

// 3. WEBHOOKS
app.get('/api/webhook', (req, res) => {
    if (req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) {
        return res.send(req.query['hub.challenge']);
    }
    res.sendStatus(403);
});

app.post('/api/webhook', async (req, res) => {
    res.sendStatus(200); 
    const body = req.body;
    if (!body.entry?.[0]?.changes?.[0]?.value?.messages) return;

    const message = body.entry[0].changes[0].value.messages[0];
    const phoneId = body.entry[0].changes[0].value.metadata.phone_number_id;
    const patientPhone = message.from;

    console.log(`📩 Incoming message from ${patientPhone}`);
    
    try {
        const result = await pool.query('SELECT * FROM consultants WHERE whatsapp_phone_id = $1', [phoneId]);
        if (result.rows.length === 0) return console.log("⚠️ Consultant not found in DB.");

        const consultant = result.rows[0];
        const rawToken = decrypt(consultant.whatsapp_access_token);

        if (message.type === 'text') {
            const replyText = `Hello! You are messaging ${consultant.name}. How can I help you today?`;
            await sendReply(phoneId, patientPhone, rawToken, replyText);
        }
    } catch (err) {
        console.error("❌ Webhook Logic Error:", err.message);
    }
});

// 4. START SERVER
const PORT = process.env.PORT || 10000;
app.listen(PORT, async () => {
    await initDatabase();
    console.log(`🟢 MedicareAI Live on port ${PORT}`);
});
