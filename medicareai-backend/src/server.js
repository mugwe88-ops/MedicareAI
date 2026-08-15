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

// Database & Routes
import pool from "./utils/db.js";
import authRoutes from "./routes/auth.js";
import appointmentRoutes from "./routes/appointment.routes.js";
import directoryRoutes from "./routes/directory.js";
import paymentRoutes from "./routes/payments.routes.js";
import bookingRoutes from "./routes/bookings.routes.js";
import doctorRoutes from "./routes/doctors.routes.js";
import telehealthRouter from "./routes/telehealth.js"; 
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
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

const allowedOrigins = [
  "https://medicare-ai-two.vercel.app",
  "https://www.medicare-ai-two.vercel.app",
  "https://medicareai-backend.onrender.com",
  "https://medicareai-1.onrender.com",
  "http://localhost:3000",
  "http://localhost:5173",
  /\.github\.dev$/,
  /\.vercel\.app$/,
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.some((allowed) =>
      typeof allowed === "string" ? allowed === origin : allowed.test(origin)
    );

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS Access requested from untrusted origin: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Accept",
    "X-Requested-With",
    "Origin",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers",
  ],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options(/(.*)/, cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ======================
   3️⃣ API ROUTES
====================== */
app.use("/api/telehealth", telehealthRouter);
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/directory", directoryRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/bookings", bookingRoutes);

// GET All Active Doctors (Filterable by specialization)
app.get("/api/doctors-list", verifyToken, async (req, res) => {
  try {
    const { specialization } = req.query;
    let query = `SELECT id, name, specialization, city, status FROM users WHERE LOWER(role) = 'doctor'`;
    let values = [];

    if (specialization) {
      query += ` AND LOWER(specialization) = LOWER($1)`;
      values.push(specialization);
    }

    query += ` ORDER BY name ASC`;

    const result = await pool.query(query, values);
    return res.json(result.rows);
  } catch (err) {
    console.error("Error fetching doctors:", err);
    return res.status(500).json({ error: "Failed to fetch doctors list" });
  }
});

// Medical Records & Prescriptions for Logged-In Patient
app.get("/api/records", verifyToken, async (req, res) => {
  const patientId = parseInt(req.user?.id || req.user?.userId || req.user?.user_id, 10);

  try {
    const userResult = await pool.query("SELECT name FROM users WHERE id = $1", [patientId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User profile not found" });
    }

    const userName = userResult.rows[0].name;

    const recordsResult = await pool.query(
      `SELECT * FROM prescriptions 
       WHERE LOWER(patient_name) = LOWER($1) 
       ORDER BY created_at DESC`,
      [userName || ""]
    );

    return res.json(recordsResult.rows);
  } catch (err) {
    console.error("❌ Error reading medical records ledger:", err.message);
    return res.status(500).json({ error: "Failed to load medical records", details: err.message });
  }
});

// GET Doctor Prescriptions
app.get("/api/doctor/prescriptions", verifyToken, async (req, res) => {
  try {
    const doctorId = parseInt(req.user?.id || req.user?.userId || req.user?.user_id, 10);

    const result = await pool.query(
      `SELECT * FROM prescriptions 
       WHERE doctor_id = $1 
       ORDER BY created_at DESC`,
      [doctorId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching prescriptions:", err);
    res.status(500).json({ error: "Server error fetching prescriptions." });
  }
});

// POST New Prescription
app.post("/api/doctor/prescriptions", verifyToken, async (req, res) => {
  const { patient_name, medication_details } = req.body;
  const doctorId = parseInt(req.user?.id || req.user?.userId || req.user?.user_id, 10);

  if (!patient_name || !medication_details) {
    return res.status(400).json({ error: "Patient name and medication details are required." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO prescriptions (doctor_id, patient_name, medication_details, status)
       VALUES ($1, $2, $3, 'Issued') 
       RETURNING *`,
      [doctorId, patient_name, medication_details]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating prescription:", err);
    res.status(500).json({ error: "Server error saving prescription." });
  }
});

app.use("/api/doctor", doctorRoutes);

// Filtered Appointments for Logged-In Patients
app.get("/api/my-appointments", verifyToken, async (req, res) => {
  const patient_id = parseInt(req.user?.id || req.user?.userId || req.user?.user_id, 10); 
  try {
    const result = await pool.query(
      `SELECT a.*, d.name as doctor_name 
       FROM appointments a 
       LEFT JOIN users d ON a.doctor_id = d.id 
       WHERE a.patient_id = $1 
       ORDER BY a.created_at DESC`,
      [patient_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching filtered appointments:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create New Appointment for Patient
app.post("/api/my-appointments", verifyToken, async (req, res) => {
  try {
    const rawId = req.user?.id || req.user?.userId || req.user?.user_id;
    const patient_id = parseInt(rawId, 10);

    if (!patient_id || isNaN(patient_id)) {
      return res.status(400).json({ error: "Invalid user session. Please re-login." });
    }

    // 1️⃣ Fetch patient name automatically from the database using patient_id
    const userResult = await pool.query("SELECT name FROM users WHERE id = $1", [patient_id]);
    const patient_name = userResult.rows[0]?.name || "Anonymous Patient";

    let { department, doctor_id, appointment_date, appointment_time, reason } = req.body;

    if (!appointment_date || !appointment_time) {
      return res.status(400).json({ error: "Date and time are required." });
    }

    if (appointment_time && appointment_time.length === 5) {
      appointment_time = `${appointment_time}:00`;
    }

    const safeDept = department || "General Medicine";
    const safeReason = reason || "";
    const safeDoctorId = doctor_id ? parseInt(doctor_id, 10) : null;

    // 2️⃣ Include patient_name in the query
    const query = `
      INSERT INTO appointments (patient_id, patient_name, doctor_id, department, appointment_date, appointment_time, reason, status)
      VALUES ($1, $2, $3, $4, $5::date, $6::time, $7, 'confirmed')
      RETURNING *;
    `;

    const result = await pool.query(query, [
      patient_id,
      patient_name,
      safeDoctorId,
      safeDept,
      appointment_date,
      appointment_time,
      safeReason
    ]);

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ DB Insert Error on /api/my-appointments:", err);
    return res.status(500).json({ 
      error: "Failed to book appointment.", 
      details: err.message || "Database query failure" 
    });
  }
});

// Filtered Appointments for Doctors (Strict Doctor Assignment)
app.get("/api/appointments/doctor", verifyToken, async (req, res) => {
  try {
    let doctor_id = parseInt(req.user?.id || req.user?.userId || req.user?.user_id, 10);
    const user_role = req.user?.role?.toLowerCase();

    if (user_role !== "doctor") {
      return res.status(403).json({ error: "Access denied. Restricted to medical professionals." });
    }

    // Fallback: If JWT payload did not contain a valid integer ID, look up user ID by email
    if (!doctor_id || isNaN(doctor_id)) {
      if (req.user?.email) {
        const userRes = await pool.query("SELECT id FROM users WHERE LOWER(email) = LOWER($1)", [req.user.email]);
        if (userRes.rows.length > 0) {
          doctor_id = userRes.rows[0].id;
        }
      }
    }

    if (!doctor_id || isNaN(doctor_id)) {
      return res.status(400).json({ error: "Unable to identify doctor session ID." });
    }

    const result = await pool.query(
      `SELECT a.*, COALESCE(u.name, a.patient_name) as patient_name, u.phone 
       FROM appointments a
       LEFT JOIN users u ON a.patient_id = u.id
       WHERE a.doctor_id = $1 OR a.doctor_id IS NULL
       ORDER BY a.appointment_date ASC, a.appointment_time ASC`,
      [doctor_id]
    );

    return res.json(result.rows);
  } catch (err) {
    console.error("Error fetching provider specialized records:", err);
    return res.status(500).json({ error: "Internal server error reading appointment ledger" });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "API is running" });
});

/* ======================
   4️⃣ DATABASE INIT & MIGRATIONS
====================== */
async function initDatabase() {
  try {
    console.log("⚙️ Initializing database schema...");

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
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        doctor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        department VARCHAR(100),
        appointment_date DATE,
        appointment_time TIME,
        reason TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS prescriptions (
        id SERIAL PRIMARY KEY,
        doctor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        patient_name VARCHAR(255) NOT NULL,
        medication_details TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'issued',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Schema Migrations
    const migrations = [
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS specialization VARCHAR(255);",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS license_number VARCHAR(255);",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(255);",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Available';",
      "ALTER TABLE appointments ADD COLUMN IF NOT EXISTS department VARCHAR(100);",
      "ALTER TABLE appointments ADD COLUMN IF NOT EXISTS doctor_id INTEGER REFERENCES users(id) ON DELETE SET NULL;",
      "ALTER TABLE appointments ADD COLUMN IF NOT EXISTS appointment_date DATE;",
      "ALTER TABLE appointments ADD COLUMN IF NOT EXISTS appointment_time TIME;",
      "ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reason TEXT;",
      "ALTER TABLE appointments ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';",
      "ALTER TABLE appointments ALTER COLUMN appointment_time TYPE TIME USING appointment_time::time;"
    ];

    for (const query of migrations) { 
      await pool.query(query); 
    }

    console.log("✅ PostgreSQL schema ready and updated with all migrations.");
  } catch (err) {
    console.error("❌ DB INIT ERROR:", err);
    process.exit(1); 
  }
}

/* ======================
   5️⃣ STATIC & CATCH-ALL
====================== */
const publicPath = path.join(__dirname, "../public");
app.use(express.static(publicPath));

app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ error: "API route not found" });
  }
  res.sendFile(path.join(publicPath, "index.html"));
});

/* ======================
   6️⃣ START SERVER
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