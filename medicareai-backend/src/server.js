import 'dotenv/config';
import express from 'express';
import axios from 'axios';
import pkg from 'pg';
const { Pool } = pkg;
import { encrypt, decrypt } from './encryption.js';

const app = express();

// 1. MIDDLEWARE
app.use(express.json()); 

// 2. DATABASE CONNECTION
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// 3. ONBOARDING ROUTE
app.post('/api/admin/onboard', async (req, res) => {
    try {
        const { whatsapp_phone_id, whatsapp_access_token, name, booking_url, calendar_id } = req.body;

        if (!whatsapp_phone_id || !whatsapp_access_token || !name) {
            return res.status(400).json({ error: "Missing required fields" });
        }

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
        console.log(`✅ Success: Onboarded ${name}`);
        res.status(201).json({ message: "Consultant saved securely", data: result.rows[0] });
    } catch (err) {
        console.error("❌ Onboarding Route Error:", err.message);
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
});

// 4. WEBHOOK ROUTES
app.get('/api/webhook', (req, res) => {
    const token = req.query['hub.verify_token'];
    if (token === process.env.VERIFY_TOKEN) return res.send(req.query['hub.challenge']);
    res.sendStatus(403);
});

app.post('/api/webhook', async (req, res) => {
    res.sendStatus(200);
    // Future: Add message processing logic here
});

// 5. GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error("❌ Malformed JSON detected from client");
        return res.status(400).json({ error: "Bad JSON format. Check your Postman body." });
    }
    next();
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🟢 MedicareAI Server is Live!`);
    console.log(`📍 Onboarding URL: /api/admin/onboard`);
});