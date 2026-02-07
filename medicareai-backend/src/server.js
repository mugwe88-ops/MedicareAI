import 'dotenv/config';
import express from 'express';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import cron from 'node-cron'; 
import cors from 'cors';
import { encrypt, decrypt } from './encryption.js';
import { pool } from './db.js'; 
import authRoutes from './routes/auth.js';
import appointmentRoutes from './routes/appointments.js';
import directoryRoutes from './routes/directory.js';
import paymentRoutes from './routes/payments.routes.js';
import bookingRoutes from './routes/bookings.routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));


// --- 1. DATABASE & SCHEMA SETUP ---
async function initDatabase() {
    try {
        // Create tables and add columns safely
        await pool.query(`
            CREATE TABLE IF NOT EXISTS "session" (
              "sid" varchar NOT NULL COLLATE "default" PRIMARY KEY,
              "sess" json NOT NULL,
              "expire" timestamp(6) NOT NULL
            );
            CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");

            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role VARCHAR(50) DEFAULT 'patient',
                email_otp VARCHAR(6),
                is_verified BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                otp_expiry TIMESTAMP,
                specialty VARCHAR(100),
                phone VARCHAR(20),
                kmpdc_number VARCHAR(255)
            );

            ALTER TABLE users ADD COLUMN IF NOT EXISTS kmpdc_number VARCHAR(255);
            ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expiry TIMESTAMP;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

            CREATE TABLE IF NOT EXISTS consultants (
                id SERIAL PRIMARY KEY,
                whatsapp_phone_id VARCHAR(255) UNIQUE NOT NULL,
                whatsapp_access_token TEXT NOT NULL,
                name VARCHAR(255) NOT NULL,
                booking_url TEXT NOT NULL,
                calendar_id VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

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

            CREATE TABLE IF NOT EXISTS analytics (
                id SERIAL PRIMARY KEY,
                doctor_id INT REFERENCES users(id),
                event_type VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS verified_kmpdc (
                registration_number VARCHAR(50) PRIMARY KEY,
                doctor_name VARCHAR(255)
            );

            -- FIXED: Using ON CONFLICT to prevent "Duplicate Key" crash
            INSERT INTO verified_kmpdc (registration_number, doctor_name) 
            VALUES 
            ('TEST-999-MD', 'Troubleshooting Account'),
            ('A1234', 'Dr. Real Doctor')
            ON CONFLICT (registration_number) DO NOTHING;
        `);
        console.log("✅ Database Tables & Sessions Initialized");
    } catch (err) {
        console.error("❌ Database Init Error:", err.message);
    }
}
initDatabase();

// --- 2. MIDDLEWARE & CORS ---
app.set('trust proxy', 1); // Crucial for Render cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors({
    origin: [
        'http://localhost:5500',
        'http://127.0.0.1:5500',
        'https://medicareai-4av2.onrender.com'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// --- 3. SESSION CONFIG (CONSOLIDATED) ---
app.use(session({
    store: new (require('connect-pg-simple')(session))({
        conString: process.env.DATABASE_URL,
    }),
    secret: process.env.SESSION_SECRET || 'super-secret-key',
    resave: false,
    saveUninitialized: false,
    proxy: true, // Required for Render/Heroku/Proxies
    cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        secure: true, // MUST be true for HTTPS on Render
        sameSite: 'none', // Critical if your frontend and backend domains differ slightly
        httpOnly: true
    }
}));

// --- 4. WHATSAPP LOGIC ---
export async function sendReply(phoneId, to, token, text, isButton = false) {
    const url = `https://graph.facebook.com/v18.0/${phoneId}/messages`;
    const data = isButton ? {
        messaging_product: "whatsapp",
        to,
        type: "interactive",
        interactive: {
            type: "button",
            body: { text },
            action: {
                buttons: [{ type: "reply", reply: { id: "book_now", title: "Book Now" } }]
            }
        }
    } : {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text }
    };

    try {
        await axios.post(url, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
    } catch (error) {
        console.error("WhatsApp Send Error:", error.response?.data || error.message);
    }
}

// Webhook Verification
app.get('/api/webhook', (req, res) => {
    if (req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) {
        return res.send(req.query['hub.challenge']);
    }
    res.sendStatus(403);
});

// Webhook Handler
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

// --- 5. CRON JOBS ---
cron.schedule('0 20 * * 0', async () => {
    try {
        const doctors = await pool.query(`
            SELECT u.id, u.name, u.phone, COUNT(a.id) as clicks 
            FROM users u 
            LEFT JOIN analytics a ON u.id = a.doctor_id 
            WHERE u.role = 'doctor' AND a.created_at > NOW() - INTERVAL '7 days'
            GROUP BY u.id
        `);

        for (const doc of doctors.rows) {
            const reportMsg = `*Swift MD Weekly Report* 📈\n\nHello Dr. ${doc.name}!\n\nThis week, your profile received *${doc.clicks}* booking inquiries.`;
            await sendReply(process.env.WHATSAPP_PHONE_ID, doc.phone, process.env.WHATSAPP_ACCESS_TOKEN, reportMsg, false);
        }
        console.log("Weekly reports sent.");
    } catch (err) {
        console.error("Cron Error:", err);
    }
});

// --- 6. ROUTES & STATIC FILES ---
app.get('/health', (req, res) => res.status(200).json({ status: 'OK' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/directory', directoryRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/bookings', bookingRoutes);

// Static File Routing (Handle SPA/Clean URLs)
app.get('/:page', (req, res, next) => {
    const page = req.params.page;
    if (page.startsWith('api')) return next(); // Skip API routes
    
    let filePath = path.join(__dirname, 'public', page);
    if (!page.includes('.')) filePath += '.html';

    res.sendFile(filePath, (err) => {
        if (err) res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// 404 Handler
app.use((req, res) => res.status(404).json({ error: "Route not found" }));

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Swift MD live on port ${PORT}`);
});