import 'dotenv/config'; 
import express from 'express';
import axios from 'axios';
import pkgPg from 'pg';
const { Pool } = pkgPg;

// FIX 1: ESM Compatible Import for Prisma 7
import pkgPrisma from '@prisma/client';
const { PrismaClient } = pkgPrisma;
import { PrismaPg } from '@prisma/adapter-pg';

import { encrypt, decrypt } from '../encryption.js'; 

const app = express();
app.use(express.json());

// FIX 2: Explicitly set up the Pool and Adapter
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Optional: Test DB Connection on Startup
try {
    await prisma.$connect();
    console.log("💎 Database Synced: Dr. House is active.");
} catch (err) {
    console.error("❌ DB Init Error:", err.message);
}

// ... rest of your routes
// --- 1. DIAGNOSTIC HOME ROUTE ---
// Open your Render URL in a browser. If you see this, the server is ALIVE.
app.get('/', (req, res) => {
    res.send('<h1>🟢 MedicareAI is Online</h1><p>Webhook path: <code>/api/webhook</code></p>');
});

// --- 2. SELF-HEALING DATABASE ---
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

        const token = process.env.WHATSAPP_ACCESS_TOKEN;
        const phoneId = process.env.PHONE_NUMBER_ID;

        if (token && phoneId) {
            const encryptedToken = encrypt(token);
            await pool.query(`
                INSERT INTO consultants (name, whatsapp_phone_id, whatsapp_access_token, booking_url)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (whatsapp_phone_id) 
                DO UPDATE SET whatsapp_access_token = $3;
            `, ["Dr. House", phoneId, encryptedToken, "https://calendly.com/test"]);
            console.log("💎 Database Synced: Dr. House is active.");
        }
    } catch (err) {
        console.error("❌ DB Init Error:", err.message);
    }
}

// --- 3. SEND REPLY ---
async function sendReply(phoneId, to, token, text) {
    const cleanTo = to.replace('+', ''); 
    const url = `https://graph.facebook.com/v22.0/${phoneId}/messages`;
    try {
        await axios.post(url, {
            messaging_product: "whatsapp",
            to: cleanTo,
            type: "text",
            text: { body: text }
        }, { 
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            } 
        });
        console.log(`✅ Message sent to ${cleanTo}`);
    } catch (err) {
        console.error("❌ Meta API Error:", err.response?.data || err.message);
    }
}

// --- 4. WEBHOOKS ---
// Meta uses this GET route to verify your URL
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

// Meta uses this POST route to send you messages
app.post('/api/webhook', async (req, res) => {
    res.sendStatus(200); // Always acknowledge immediately
    const body = req.body;
    
    if (body.object === 'whatsapp_business_account') {
        const changes = body.entry?.[0]?.changes?.[0]?.value;
        const message = changes?.messages?.[0];
        
        if (message) {
            const phoneId = changes.metadata.phone_number_id;
            const patientPhone = message.from;
            console.log(`📩 Incoming message from ${patientPhone}`);
            
            try {
                const result = await pool.query('SELECT * FROM consultants WHERE whatsapp_phone_id = $1', [phoneId]);
                if (result.rows.length > 0) {
                    const consultant = result.rows[0];
                    const rawToken = decrypt(consultant.whatsapp_access_token);
                    await sendReply(phoneId, patientPhone, rawToken, `Hello! You are messaging ${consultant.name}. How can I help you?`);
                } else {
                    console.log(`⚠️ No consultant found for ID: ${phoneId}`);
                }
            } catch (err) {
                console.error("❌ Webhook Logic Error:", err.message);
            }
        }
    }
});

// --- 5. START SERVER ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', async () => {
    await initDatabase();
    console.log(`🟢 MedicareAI Live on port ${PORT}`);
});
