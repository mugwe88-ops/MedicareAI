import 'dotenv/config';
import express from 'express';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import { encrypt, decrypt } from '../encryption.js';
import { pool } from '../db.js'; // Modular DB
import authRoutes from './routes/auth.js'; // Modular Routes
import appointmentRoutes from './routes/appointments.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/appointments', appointmentRoutes);

// Session Configuration (Must be before routes)
app.use(session({
    secret: process.env.SESSION_SECRET || 'medicare_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production', 
        maxAge: 24 * 60 * 60 * 1000 
    }
}));

// Serve Static Files from the public folder (going up one level from src)
app.use(express.static(path.join(__dirname, '../public')));

// Use Modular Auth Routes
app.use('/api', authRoutes);

// --- YOUR EXISTING WHATSAPP LOGIC ---
// Database Initialization
async function initDatabase() {
    const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role VARCHAR(50) DEFAULT 'patient',
            email_otp VARCHAR(6),
            is_verified BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    const createConsultantsTable = `
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
    const createAppointmentsTable = `
    CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER REFERENCES users(id),
        department VARCHAR(100),
        appointment_date DATE,
        appointment_time TIME,
        reason TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
`;
await pool.query(createAppointmentsTable);

    try {
        await pool.query(createUsersTable);
        await pool.query(createConsultantsTable);
        console.log("✅ Database Tables Initialized");
    } catch (err) {
        console.error("❌ Database Init Error:", err.message);
    }
}

app.post('/api/admin/onboard', async (req, res) => {
    try {
        const { whatsapp_phone_id, whatsapp_access_token, name, booking_url, calendar_id } = req.body;
        const secureToken = encrypt(whatsapp_access_token);
        const result = await pool.query(
            `INSERT INTO consultants (whatsapp_phone_id, whatsapp_access_token, name, booking_url, calendar_id)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (whatsapp_phone_id) DO UPDATE SET whatsapp_access_token = EXCLUDED.whatsapp_access_token, name = EXCLUDED.name
             RETURNING id, name`,
            [whatsapp_phone_id, secureToken, name, booking_url, calendar_id]
        );
        res.status(201).json({ message: "Consultant saved securely", data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
});

app.get('/api/webhook', (req, res) => {
    const token = req.query['hub.verify_token'];
    if (token === process.env.VERIFY_TOKEN) return res.send(req.query['hub.challenge']);
    res.sendStatus(403);
});

app.post('/api/webhook', async (req, res) => {
    res.sendStatus(200);
    const body = req.body;
    if (!body.entry?.[0]?.changes?.[0]?.value?.messages) return;

    const message = body.entry[0].changes[0].value.messages[0];
    const phoneId = body.entry[0].changes[0].value.metadata.phone_number_id;
    const patientPhone = message.from;

    try {
        const result = await pool.query('SELECT * FROM consultants WHERE whatsapp_phone_id = $1', [phoneId]);
        if (result.rows.length === 0) return;

        const consultant = result.rows[0];
        const rawToken = decrypt(consultant.whatsapp_access_token);

        if (message.type === 'text') {
            await sendReply(phoneId, patientPhone, rawToken, `Hello! You are messaging ${consultant.name}.`, true);
        }
    } catch (err) {
        console.error("Webhook Logic Error:", err.message);
    }
});

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

// Ensure the server starts correctly
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🟢 MedicareAI Live on port ${PORT}!`));