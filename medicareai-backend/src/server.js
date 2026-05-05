/* ======================
   0️⃣ ENV & IMPORTS
====================== */
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import helmet from "helmet";
import axios from "axios";

// Database & Routes
import pool from "./utils/db.js";
import authRoutes from "./routes/auth.js";
import appointmentRoutes from "./routes/appointment.routes.js";
import directoryRoutes from "./routes/directory.js";
import paymentRoutes from "./routes/payments.routes.js";
import bookingRoutes from "./routes/bookings.routes.js";
import doctorRoutes from "./routes/doctors.routes.js";
import resultsRoutes from "./routes/labRoutes.js";
import { verifyToken } from "./utils/jwt.js";

/* ======================
   1️⃣ APP INIT
====================== */
const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.set("trust proxy", 1);

/* ======================
   2️⃣ MIDDLEWARE & CORS
====================== */
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const allowedOrigins = [
  "https://medicare-ai-two.vercel.app",
  "https://www.medicare-ai-two.vercel.app",
  "https://medicareai-1.onrender.com",
  "http://localhost:3000",
  "http://localhost:5173",
  /\.github\.dev$/,
  /\.vercel\.app$/ 
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.some((allowed) => 
      typeof allowed === "string" ? allowed === origin : allowed.test(origin)
    );
    if (isAllowed) {
      callback(null, true);
    } else {
      console.error(`CORS blocked for origin: ${origin}`);
      callback(new Error("CORS blocked this origin"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With"]
}));

app.options("*", cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ======================
   3️⃣ API ROUTES
====================== */
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/directory", directoryRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/results", resultsRoutes);

// Filtered Appointments for Patients
app.get("/api/my-appointments", verifyToken, async (req, res) => {
  const patient_id = req.user.id; 
  try {
    const result = await pool.query(
      "SELECT * FROM appointments WHERE patient_id = $1 ORDER BY created_at DESC",
      [patient_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching filtered appointments:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "API is running" });
});

/* ======================
   4️⃣ WHATSAPP WEBHOOKS
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
   5️⃣ DATABASE INIT (CORE + MISSING TABLES)
====================== */
async function initDatabase() {
  try {
    console.log("⚙️ Initializing database schema...");

    // Users & Roles
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

    // Dynamic Migrations
    const migrations = [
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS specialization VARCHAR(255);",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS license_number VARCHAR(255);",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(255);",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);"
    ];
    for (const query of migrations) { await pool.query(query); }

    // Analytics Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS analytics (
        id SERIAL PRIMARY KEY,
        doctor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        event_type VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Consultants / WhatsApp Integration
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

    // Appointments
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

    // KMPDC Verification
    await pool.query(`
      CREATE TABLE IF NOT EXISTS verified_kmpdc (
        registration_number VARCHAR(50) PRIMARY KEY,
        doctor_name VARCHAR(255)
      );
    `);

    // Seed Troubleshooting Account
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
   6️⃣ STATIC & CATCH-ALL
====================== */
app.use(express.static(path.join(__dirname, "public")));

app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ error: "API route not found" });
  }
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* ======================
   7️⃣ START SERVER
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