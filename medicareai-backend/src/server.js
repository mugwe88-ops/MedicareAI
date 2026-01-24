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
app.post('/api/webhook', async (req, res) => {
    res.sendStatus(200); // Always tell Meta we got it!

    const body = req.body;
    // Log everything so we can see it later
    console.log("📩 Received Webhook:", JSON.stringify(body, null, 2));

    if (!body.entry?.[0]?.changes?.[0]?.value?.messages) return;

    const message = body.entry[0].changes[0].value.messages[0];
    const phoneId = body.entry[0].changes[0].value.metadata.phone_number_id;
    const patientPhone = message.from;

    // FORCING A REPLY TO TEST CONNECTION (Bypasses DB)
    try {
        const testToken = "PASTE_YOUR_META_TOKEN_HERE"; // Use your fresh token
        await sendReply(phoneId, patientPhone, testToken, "Connection Success! Dr. House is listening.", false);
        console.log("✅ Test reply sent to:", patientPhone);
    } catch (err) {
        console.error("❌ Test Reply Failed:", err.response?.data || err.message);
    }
});

// 2. WEBHOOK VERIFICATION
app.get('/api/webhook', (req, res) => {
    const token = req.query['hub.verify_token'];
    if (token === process.env.VERIFY_TOKEN) return res.send(req.query['hub.challenge']);
    res.sendStatus(403);
});

// 3. RECEIVING MESSAGES
app.post('/api/webhook', (req, res) => {
    console.log("📩 Incoming Webhook Data:", JSON.stringify(req.body, null, 2));
    res.sendStatus(200);    
});

// 4. START SERVER
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🟢 MedicareAI Live on port ${PORT}`);
});

// 3. DYNAMIC WEBHOOK PROCESSING
app.post('/api/webhook', async (req, res) => {
    res.sendStatus(200);
    const body = req.body;
    if (!body.entry?.[0]?.changes?.[0]?.value?.messages) return;

    const message = body.entry[0].changes[0].value.messages[0];
    const phoneId = body.entry[0].changes[0].value.metadata.phone_number_id;
    const patientPhone = message.from;

    // 🟢 ADD THIS TEMPORARY LOG TO BYPASS DB CHECK FOR TESTING
    console.log("Incoming message from:", patientPhone, "via PhoneID:", phoneId);
    
    try {
        const result = await pool.query('SELECT * FROM consultants WHERE whatsapp_phone_id = $1', [phoneId]);
        
        // If Database is empty, send a generic reply so we know it works!
        if (result.rows.length === 0) {
            console.log("DB lookup failed, sending fallback reply.");
            return await sendReply(phoneId, patientPhone, "YOUR_TEMPORARY_TOKEN_HERE", "Dr. House is online! (Database lookup skipped)", false);
        }

        const consultant = result.rows[0];
        const rawToken = decrypt(consultant.whatsapp_access_token);

        if (message.type === 'text') {
            await sendReply(phoneId, patientPhone, rawToken, `Hello! You are messaging ${consultant.name}.`, true);
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
