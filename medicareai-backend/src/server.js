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
   4️⃣ ROUTES
====================== */
// IMPORTANT: Routes must come BEFORE the static file handlers
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/directory", directoryRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/doctors", doctorRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "API is running" });
});

app.get("/api/protected", verifyToken, (req, res) => {
  res.json({ message: "Protected route success", user: req.user });
});

/* ======================
   5️⃣ DATABASE INIT (WITH MIGRATIONS)
====================== */
async function initDatabase() {
  try {
    console.log("⚙️ Initializing database...");

    // 1. Create the base users table if it doesn't exist at all
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

    // 2. MIGRATION: Add missing columns if they don't exist in the existing table
    // This is crucial for fixing the 500 Internal Server Error
    const migrations = [
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS specialization VARCHAR(255);",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS license_number VARCHAR(255);",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(255);",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);"
    ];

    for (const query of migrations) {
      await pool.query(query);
    }

    // ✅ ANALYTICS
    await pool.query(`
      CREATE TABLE IF NOT EXISTS analytics (
        id SERIAL PRIMARY KEY,
        doctor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        event_type VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ✅ CONSULTANTS
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

    // ✅ APPOINTMENTS
    await pool.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        department VARCHAR(100),
        appointment_date DATE,
        appointment_time TIME,
        reason TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ✅ VERIFIED DOCTORS
    await pool.query(`
      CREATE TABLE IF NOT EXISTS verified_kmpdc (
        registration_number VARCHAR(50) PRIMARY KEY,
        doctor_name VARCHAR(255)
      );
    `);

    // ✅ SEED DATA
    await pool.query(`
      INSERT INTO verified_kmpdc (registration_number, doctor_name)
      VALUES ('TEST-999-MD', 'Troubleshooting Account')
      ON CONFLICT (registration_number) DO NOTHING;
    `);

    console.log("✅ PostgreSQL schema ready and updated");
  } catch (err) {
    console.error("❌ DB INIT ERROR:", err);
    process.exit(1); 
  }
}

/* ======================
   6️⃣ WHATSAPP / WEBHOOK
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
   7️⃣ STATIC & CATCH-ALL
====================== */
app.use(express.static(path.join(__dirname, "public")));

// ⚠️ CATCH-ALL MUST BE LAST
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ error: "API route not found" });
  }
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* ======================
   8️⃣ START SERVER
====================== */
async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Startup failed:", err);
    process.exit(1);
  }
}

startServer();