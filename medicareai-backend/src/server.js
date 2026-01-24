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

// 1. SELF-HEALING DATABASE
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

        // Grab values from Render Environment Variables
        const token = process.env.WHATSAPP_ACCESS_TOKEN;
        const phoneId = process.env.PHONE_NUMBER_ID; // Now pulled from Env

        if (token && phoneId) {
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

// 2. SEND REPLY (Using v22.0)
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
        console.error("❌ Meta API Error:", err.response?.data || err.message);
    }
}

// 3. WEBHOOKS
// GET: Used by Meta to verify your endpoint
app.get('/api/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
        console.log("✅ Webhook Verified by Meta");
        return res.status(200).send(challenge);
    }
    res.sendStatus(403);
});

// POST: Receives the actual messages
app.post('/api/webhook', async (req, res) => {
    // Always acknowledge the webhook immediately
    res.sendStatus(200); 

    const body = req.body;
    
    // Check if this is a message event
    if (body.object === 'whatsapp_business_account') {
        if (body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
            const entry = body.entry[0].changes[0].value;
            const message = entry.messages[0];
            const phoneId = entry.metadata.phone_number_id;
            const patientPhone = message.from;

            console.log(`📩 Incoming message from ${patientPhone}`);
            
            try {
                // Find the consultant associated with this phone number ID
                const result = await pool.query('SELECT * FROM consultants WHERE whatsapp_phone_id = $1', [phoneId]);
                
                if (result.rows.length > 0) {
                    const consultant = result.rows[0];
                    const rawToken = decrypt(consultant.whatsapp_access_token);

                    if (message.type === 'text') {
                        const replyText = `Hello! You are messaging ${consultant.name}. How can I help you today?`;
                        await sendReply(phoneId, patientPhone, rawToken, replyText);
                    }
                } else {
                    console.log(`⚠️ No consultant found in DB for Phone ID: ${phoneId}`);
                }
            } catch (err) {
                console.error("❌ Webhook Logic Error:", err.message);
            }
        }
    }
});

// 4. START SERVER
const PORT = process.env.PORT || 10000;
app.listen(PORT, async () => {
    await initDatabase();
    console.log(`🟢 MedicareAI Live on port ${PORT}`);
});
