/* ======================
   0️⃣ ENV
====================== */
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import helmet from "helmet";
import axios from "axios";

/* ======================
   DB
====================== */
import pool from "./utils/db.js";

/* ======================
   ROUTES
====================== */
import authRoutes from "./routes/auth.js";
import appointmentRoutes from "./routes/appointment.routes.js";
import directoryRoutes from "./routes/directory.js";
import paymentRoutes from "./routes/payments.routes.js";
import bookingRoutes from "./routes/bookings.routes.js";
import doctorRoutes from "./routes/doctors.routes.js";
import { verifyToken } from "./utils/jwt.js";

/* ======================
   1️⃣ APP INIT
====================== */
const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* ======================
   2️⃣ TRUST PROXY
====================== */
app.set("trust proxy", 1);

/* ======================
   3️⃣ MIDDLEWARE
====================== */
app.use(helmet());

app.use(cors({
  origin: [
    "https://medicare-ai-two.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173"
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ======================
   4️⃣ ROUTES (API FIRST!)
====================== */
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/directory", directoryRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/doctors", doctorRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/protected", verifyToken, (req, res) => {
  res.json({ message: "Protected route success", user: req.user });
});

/* ======================
   5️⃣ DATABASE INIT
====================== */
async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(50) DEFAULT 'patient',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS analytics (
        id SERIAL PRIMARY KEY,
        doctor_id INTEGER REFERENCES users(id),
        event_type VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
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

    console.log("✅ PostgreSQL ready");
  } catch (err) {
    console.error("❌ DB ERROR:", err);
    process.exit(1);
  }
}

/* ======================
   6️⃣ WHATSAPP
====================== */
export async function sendReply(phoneId, to, token, text, isButton = false) {
  const url = `https://graph.facebook.com/v18.0/${phoneId}/messages`;

  const data = isButton
    ? {
        messaging_product: "whatsapp",
        to,
        type: "interactive",
        interactive: {
          type: "button",
          body: { text },
          action: {
            buttons: [
              {
                type: "reply",
                reply: { id: "book_now", title: "Book Now" }
              }
            ]
          }
        }
      }
    : {
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

/* ======================
   7️⃣ WEBHOOK
====================== */
app.get("/api/webhook", (req, res) => {
  if (req.query["hub.verify_token"] === process.env.VERIFY_TOKEN) {
    return res.send(req.query["hub.challenge"]);
  }
  res.sendStatus(403);
});

app.post("/api/webhook", async (req, res) => {
  res.sendStatus(200);
});

/* ======================
   8️⃣ STATIC (LAST!)
====================== */
app.use(express.static(path.join(__dirname, "public")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* ======================
   9️⃣ ERROR HANDLER
====================== */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

/* ======================
   🔟 START SERVER
====================== */
app.listen(PORT, "0.0.0.0", async () => {
  await initDatabase();
  console.log(`🚀 Server running on port ${PORT}`);
});