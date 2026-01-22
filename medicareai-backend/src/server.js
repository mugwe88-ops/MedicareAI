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

// --- NEW: AUTO-CREATE TABLE LOGIC ---
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
        console.log("✅ Database Table 'consultants' is ready!");
    } catch (err) {
        console.error("❌ Error creating table:", err.message);
    }
}
initDatabase(); // Run this when the server starts
// ------------------------------------

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
        res.status(201).json({ message: "Consultant saved securely", data: result.rows[0] });
    } catch (err) {
        console.error("❌ Onboarding Error:", err.message);
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
});

// Basic Webhook routes
app.get('/api/webhook', (req, res) => {
    const token = req.query['hub.verify_token'];
    if (token === process.env.VERIFY_TOKEN) return res.send(req.query['hub.challenge']);
    res.sendStatus(403);
});

app.post('/api/webhook', (req, res) => res.sendStatus(200));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🟢 MedicareAI Server is Live!`);
});