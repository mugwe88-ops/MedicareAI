import 'dotenv/config';
import express from 'express';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import cron from 'node-cron'; 
import { encrypt, decrypt } from './encryption.js';
import { pool } from './db.js'; 
import authRoutes from './routes/auth.js';
import appointmentRoutes from './routes/appointments.js';
import directoryRoutes from './routes/directory.js';
import paymentRoutes from './routes/payments.routes.js';
import bookingRoutes from './routes/bookings.routes.js';
import cors from 'cors';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

/* =========================
   REQUIRED FOR RENDER HTTPS
   ========================= */
app.set('trust proxy', 1);

// ---- MIDDLEWARE ----
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors({
    origin: [
        'http://localhost:5500',
        'http://127.0.0.1:5500',
        'https://medicareai-4av2.onrender.com'
    ],
    credentials: true
}));

/* =========================
   SESSION (FIXED)
   ========================= */
app.use(session({
    name: 'medicareai.sid',
    secret: process.env.SESSION_SECRET || 'medicare_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true,        // REQUIRED on Render
        httpOnly: true,
        sameSite: 'none',    // REQUIRED for cross-origin
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'MedicareAI Backend is running' });
});

// ---- DATABASE INIT (Updated with your missing columns) ----
async function initDatabase() {
    const createTablesQuery = `
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

        INSERT INTO verified_kmpdc (registration_number, doctor_name) 
        VALUES 
        ('TEST-999-MD', 'Troubleshooting Account'),
        ('A1234', 'Dr. Real Doctor');
    `;

    try {
        await pool.query(createTablesQuery);
        console.log("✅ Database Tables Initialized & Schema Verified");
    } catch (err) {
        console.error("❌ Database Init Error:", err.message);
    }
}
initDatabase();

// ---- WHATSAPP / WEBHOOK LOGIC ----
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
                buttons: [
                    { type: "reply", reply: { id: "book_now", title: "Book Now" } }
                ]
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

app.get('/api/webhook', (req, res) => {
    const token = req.query['hub.verify_token'];
    if (token === process.env.VERIFY_TOKEN) {
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

    try {
        const result = await pool.query(
            'SELECT * FROM consultants WHERE whatsapp_phone_id = $1',
            [phoneId]
        );

        if (result.rows.length === 0) return;

        const consultant = result.rows[0];
        const rawToken = decrypt(consultant.whatsapp_access_token);

        if (message.type === 'text') {
            await sendReply(
                phoneId,
                patientPhone,
                rawToken,
                `Hello! You are messaging ${consultant.name}.`,
                true
            );
        }
    } catch (err) {
        console.error("Webhook Logic Error:", err.message);
    }
});

// ---- CONSOLIDATED WEEKLY REPORT CRON ----
cron.schedule('0 20 * * 0', async () => {
    try {
        const doctors = await pool.query(`
            SELECT u.id, u.name, u.phone, COUNT(a.id) as clicks 
            FROM users u 
            LEFT JOIN analytics a ON u.id = a.doctor_id 
            WHERE u.role = 'doctor' 
              AND a.created_at > NOW() - INTERVAL '7 days'
            GROUP BY u.id
        `);

        for (const doc of doctors.rows) {
            const reportMsg =
                `*Swift MD Weekly Report* 📈\n\n` +
                `Hello Dr. ${doc.name}!\n\n` +
                `This week, your profile received *${doc.clicks}* WhatsApp booking inquiries.\n\n` +
                `Keep up the great work!`;

            await sendReply(
                process.env.WHATSAPP_PHONE_ID,
                doc.phone,
                process.env.WHATSAPP_ACCESS_TOKEN,
                reportMsg,
                false
            );
        }

        console.log("Weekly reports sent successfully.");
    } catch (err) {
        console.error("Error sending weekly reports:", err);
    }
});

// --- ROUTES & STATIC FILES ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/:page', (req, res) => {
    const page = req.params.page;
    let filePath = path.join(__dirname, 'public', page);

    if (!page.includes('.')) filePath += '.html';

    res.sendFile(filePath, (err) => {
        if (err) {
            res.sendFile(path.join(__dirname, 'public', 'index.html'));
        }
    });
});

// ---- API ROUTES ----
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/directory', directoryRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/bookings', bookingRoutes);

// ---- ERROR HANDLING ----
app.use((req, res) => {
    res.status(404).json({ error: "Route not found on server" });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Swift MD is live on port ${PORT}`);
});
