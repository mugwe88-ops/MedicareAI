import 'dotenv/config';
import express from 'express';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import cron from 'node-cron';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { encrypt, decrypt } from './encryption.js';
import pool from './db.js';

// Routes
import authRoutes from './routes/auth.js';
import appointmentRoutes from './routes/appointment.routes.js';
import directoryRoutes from './routes/directory.js';
import paymentRoutes from './routes/payments.routes.js';
import bookingRoutes from './routes/bookings.routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PgSession = connectPgSimple(session);

// ======================
// 1️⃣ TRUST PROXY (RENDER)
// ======================
app.set('trust proxy', 1);

// ======================
// 2️⃣ DATABASE INIT
// ======================
async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(50) DEFAULT 'patient',
        email_otp VARCHAR(6),
        is_verified BOOLEAN DEFAULT FALSE,
        otp_expiry TIMESTAMP,
        specialty VARCHAR(100),
        phone VARCHAR(20),
        kmpdc_number VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS session (
        sid VARCHAR PRIMARY KEY,
        sess JSON NOT NULL,
        expire TIMESTAMP NOT NULL
      );
      CREATE INDEX IF NOT EXISTS IDX_session_expire ON session(expire);
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS consultants (
        id SERIAL PRIMARY KEY,
        whatsapp_phone_id VARCHAR(255) UNIQUE NOT NULL,
        whatsapp_access_token TEXT NOT NULL,
        name VARCHAR(255) NOT NULL,
        booking_url TEXT NOT NULL,
        calendar_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
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
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS analytics (
        id SERIAL PRIMARY KEY,
        doctor_id INT REFERENCES users(id),
        event_type VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS verified_kmpdc (
        registration_number VARCHAR(50) PRIMARY KEY,
        doctor_name VARCHAR(255)
      );
    `);

    await pool.query(`
      INSERT INTO verified_kmpdc (registration_number, doctor_name)
      VALUES ('TEST-999-MD', 'Troubleshooting Account')
      ON CONFLICT DO NOTHING;
    `);

    console.log("✅ Database initialized");
  } catch (err) {
    console.error("❌ Database Init Error:", err);
  }
}
await initDatabase();

// ======================
// 3️⃣ MIDDLEWARE
// ======================
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

// ======================
// 4️⃣ SESSIONS (RENDER SAFE)
// ======================
app.use(session({
  store: new PgSession({ pool }),
  name: "medicareai.sid",
  secret: process.env.SESSION_SECRET || 'super-secret-key',
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    secure: true,          // MUST be true on Render HTTPS
    sameSite: "none",       // Required for cross-site cookies
    httpOnly: true
  }
}));

// ======================
// 5️⃣ WHATSAPP FUNCTIONS
// ======================
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
  } catch (err) {
    console.error("WhatsApp Error:", err.response?.data || err.message);
  }
}

// ======================
// 6️⃣ WEBHOOKS
// ======================
app.get('/api/webhook', (req, res) => {
  if (req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) {
    return res.send(req.query['hub.challenge']);
  }
  res.sendStatus(403);
});

app.post('/api/webhook', async (req, res) => {
  res.sendStatus(200);
  const msg = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!msg) return;

  const phoneId = req.body.entry[0].changes[0].value.metadata.phone_number_id;
  const patientPhone = msg.from;

  try {
    const result = await pool.query(
      'SELECT * FROM consultants WHERE whatsapp_phone_id=$1',
      [phoneId]
    );
    if (!result.rows.length) return;

    const consultant = result.rows[0];
    const token = decrypt(consultant.whatsapp_access_token);

    if (msg.type === 'text') {
      await sendReply(phoneId, patientPhone, token, `Hello! You are messaging ${consultant.name}.`, true);
    }
  } catch (e) {
    console.error("Webhook error:", e);
  }
});

// ======================
// 7️⃣ CRON REPORTS
// ======================
cron.schedule('0 20 * * 0', async () => {
  try {
    const doctors = await pool.query(`
      SELECT u.id, u.name, u.phone, COUNT(a.id) AS clicks
      FROM users u
      LEFT JOIN analytics a ON u.id = a.doctor_id
      WHERE u.role='doctor' AND a.created_at > NOW() - INTERVAL '7 days'
      GROUP BY u.id
    `);

    for (const d of doctors.rows) {
      const msg = `Swift MD Weekly Report 📈\nHello Dr. ${d.name}, you had ${d.clicks} bookings this week.`;
      await sendReply(process.env.WHATSAPP_PHONE_ID, d.phone, process.env.WHATSAPP_ACCESS_TOKEN, msg);
    }
  } catch (e) {
    console.error("Cron error:", e);
  }
});

// ======================
// 8️⃣ ROUTES
// ======================
app.get('/health', (req, res) => res.json({ status: 'OK' }));

app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/directory', directoryRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/bookings', bookingRoutes);

// ======================
// 9️⃣ ADMIN RESET TOOL
// ======================
app.get('/api/admin/reset', async (req, res) => {
  if (req.query.key !== (process.env.ADMIN_RESET_KEY || 'super-secret-key')) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {
    await pool.query('TRUNCATE TABLE appointments, analytics, consultants, session, users RESTART IDENTITY CASCADE;');

    const pw = await bcrypt.hash('password123', 10);

    await pool.query(`
      INSERT INTO users (name,email,password,role,is_verified,specialty,kmpdc_number)
      VALUES ('Dr. Willy','willyweyru3@gmail.com',$1,'doctor',true,'General','TEST-999-MD')
    `,[pw]);

    await pool.query(`
      INSERT INTO users (name,email,password,role,is_verified)
      VALUES ('John Doe','patient@test.com',$1,'patient',true)
    `,[pw]);

    res.json({ success:true });
  } catch (e) {
    res.status(500).json({ error:e.message });
  }
});

// ======================
// 10️⃣ STATIC FRONTEND
// ======================
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ======================
// 11️⃣ START SERVER
// ======================
const PORT = process.env.PORT || 10000;

app.get("/api/admin/fix-db", async (req, res) => {
  try {
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'patient';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;
    `);

    res.json({ success: true, message: "DB fixed" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Swift MD live on port ${PORT}`);
});
