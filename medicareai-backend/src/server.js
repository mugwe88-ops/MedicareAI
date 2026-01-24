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
    try {
        await pool.query(createTableQuery);
        console.log("✅ Database initialized successfully.");
    } catch (err) {
        console.error("❌ Database Init Error:", err.message);
    }
}
initDatabase();

// 1. WEBHOOK VERIFICATION (GET)
app.get('/api/webhook', (req, res) => {
    const token = req.query['hub.verify_token'];
    if (token === process.env.VERIFY_TOKEN) {
        return res.send(req.query['hub.challenge']);
    }
    res.sendStatus(403);
});

// 2. MAIN WEBHOOK PROCESSING (POST)
app.post('/api/webhook', async (req, res) => {
    // Always tell Meta we received the message immediately
    res.sendStatus(200); 

    const body = req.body;
    if (!body.entry?.[0]?.changes?.[0]?.value?.messages) return;

    const message = body.entry[0].changes[0].value.messages[0];
    const phoneId = body.entry[0].changes[0].value.metadata.phone_number_id;
    const patientPhone = message.from;

    console.log(`📩 Incoming message from ${patientPhone} via PhoneID: ${phoneId}`);
    
    try {
        const result = await pool.query('SELECT * FROM consultants WHERE whatsapp_phone_id = $1', [phoneId]);
        
        // If Database is empty or consultant not found
        if (result.rows.length === 0) {
            console.log("⚠️ DB lookup failed for this PhoneID.");
            return; 
        }

        const consultant = result.rows[0];
        let rawToken;
        
        try {
            rawToken = decrypt(consultant.whatsapp_access_token);
        } catch (decErr) {
            console.error("❌ Decryption failed. Check your ENCRYPTION_KEY length (must be 32).");
            return;
        }

        if (message.type === 'text') {
            const replyText = `Hello! You are messaging ${consultant.name}. How can I help you today?`;
            await sendReply(phoneId, patientPhone, rawToken, replyText, true);
            console.log(`✅ Replied to ${patientPhone}`);
        }
    } catch (err) {
        console.error("❌ Webhook Logic Error:", err.message);
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

// 3. ADMIN API (Verification Only)
app.get('/api/admin/consultants', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, whatsapp_phone_id, created_at FROM consultants');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. START SERVER (ONLY CALL THIS ONCE)
const PORT = process.env.PORT || 10000;

// EMERGENCY RESET ROUTE (Using your .env token)
app.get('/api/debug/reset', async (req, res) => {
    try {
        // 1. Clear the old, unreadable data
        await pool.query('DELETE FROM consultants');
        
        // 2. Grab the token and phone ID from your environment variables
        const name = "Dr. House";
        const phoneId = "1013054165213912"; 
        const token = process.env.WHATSAPP_ACCESS_TOKEN; // This pulls from your Render Env settings
        
        if (!token) {
            return res.status(500).send("❌ Error: WHATSAPP_ACCESS_TOKEN not found in Environment Variables.");
        }

        // 3. Encrypt it using your NEW 32-character key
        const encryptedToken = encrypt(token);
        
        await pool.query(
            'INSERT INTO consultants (name, whatsapp_phone_id, whatsapp_access_token, booking_url) VALUES ($1, $2, $3, $4)',
            [name, phoneId, encryptedToken, "https://calendly.com/test"]
        );

        res.send("✅ Database cleared and Dr. House re-added using the Token from your Environment Settings!");
    } catch (err) {
        res.status(500).send("❌ Error: " + err.message);
    }
});
app.listen(PORT, () => {
    console.log(`🟢 MedicareAI Live on port ${PORT}`);
});
