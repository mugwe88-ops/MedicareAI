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

// 1. Helper Function: Send WhatsApp Messages (v22.0)
async function sendReply(phoneId, to, token, text) {
    const cleanTo = to.replace('+', ''); // Ensure no '+' sign
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
        console.error("❌ Meta API Error Detail:", err.response?.data || err.message);
        throw err;
    }
}

// 2. WEBHOOK VERIFICATION (GET)
app.get('/api/webhook', (req, res) => {
    const token = req.query['hub.verify_token'];
    if (token === process.env.VERIFY_TOKEN) {
        return res.send(req.query['hub.challenge']);
    }
    res.sendStatus(403);
});

// 3. MAIN WEBHOOK PROCESSING (POST)
app.post('/api/webhook', async (req, res) => {
    res.sendStatus(200); 

    const body = req.body;
    if (!body.entry?.[0]?.changes?.[0]?.value?.messages) return;

    const message = body.entry[0].changes[0].value.messages[0];
    const phoneId = body.entry[0].changes[0].value.metadata.phone_number_id;
    const patientPhone = message.from;

    console.log(`📩 Incoming message from ${patientPhone} via PhoneID: ${phoneId}`);
    
    try {
        const result = await pool.query('SELECT * FROM consultants WHERE whatsapp_phone_id = $1', [phoneId]);
        
        if (result.rows.length === 0) {
            console.log("⚠️ DB lookup failed for this PhoneID.");
            return; 
        }

        const consultant = result.rows[0];
        let rawToken;
        
        try {
            rawToken = decrypt(consultant.whatsapp_access_token);
        } catch (decErr) {
            console.error("❌ Decryption failed. Check your ENCRYPTION_KEY length (32 chars).");
            return;
        }

        if (message.type === 'text') {
            const replyText = `Hello! You are messaging ${consultant.name}. How can I help you today?`;
            await sendReply(phoneId, patientPhone, rawToken, replyText);
        }
    } catch (err) {
        console.error("❌ Webhook Logic Error:", err.message);
    }
});

// 4. ADMIN API
app.get('/api/admin/consultants', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, whatsapp_phone_id, created_at FROM consultants');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. EMERGENCY RESET ROUTE
app.get('/api/debug/reset', async (req, res) => {
    try {
        await pool.query('DELETE FROM consultants');
        const token = process.env.WHATSAPP_ACCESS_TOKEN;
        
        if (!token) return res.status(500).send("❌ Error: WHATSAPP_ACCESS_TOKEN missing in Render.");

        const encryptedToken = encrypt(token);
        await pool.query(
            'INSERT INTO consultants (name, whatsapp_phone_id, whatsapp_access_token, booking_url) VALUES ($1, $2, $3, $4)',
            ["Dr. House", "1013054165213912", encryptedToken, "https://calendly.com/test"]
        );

        res.send("✅ Database cleared and Dr. House re-added!");
    } catch (err) {
        res.status(500).send("❌ Error: " + err.message);
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🟢 MedicareAI Live on port ${PORT}`);
});
