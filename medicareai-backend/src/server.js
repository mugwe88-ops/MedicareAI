/* ======================
    0️⃣ ENV & IMPORTS
====================== */
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import cors from "cors";

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
import prescriptionRoutes from "./routes/prescription.routes.js";

/* ======================
    1️⃣ APP INIT
====================== */
const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.set("trust proxy", 1);

/* ======================
    2️⃣ FAIL-SAFE CORS & MIDDLEWARE
====================== */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Add CORS before any route handlers
app.use(
  cors({
    origin: [
      "https://medicare-ai-two.vercel.app",
      "http://localhost:3000"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Custom CORS Interceptor
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  res.setHeader("Access-Control-Allow-Origin", origin || "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  
  next();
});

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
app.use("/api/doctor/prescriptions", prescriptionRoutes);
app.use("/api/prescriptions", prescriptionRoutes);

// GET All Active Doctors (Public/Authenticated)
app.get("/api/doctors-list", async (req, res) => {
  try {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    
    const { specialization } = req.query;

    let query = `
      SELECT 
        id, 
        name, 
        COALESCE(NULLIF(TRIM(specialization), ''), 'General Medicine') AS specialization, 
        city, 
        status 
      FROM users 
      WHERE LOWER(TRIM(role)) = 'doctor'
    `;
    let values = [];

    if (specialization) {
      const cleanSpec = specialization.trim();
      query += ` AND (LOWER(TRIM(specialization)) = LOWER($1) OR LOWER(specialization) LIKE LOWER($2))`;
      values.push(cleanSpec, `%${cleanSpec}%`);
    }

    query += ` ORDER BY name ASC`;

    const result = await pool.query(query, values);
    return res.json(result.rows);
  } catch (err) {
    console.error("Error fetching doctors list:", err);
    return res.status(500).json({ error: "Failed to fetch doctors list" });
  }
});

// Update Appointment Status (Completed / Cancelled)
app.patch("/api/appointments/:id/status", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["completed", "cancelled", "confirmed", "pending"].includes(status.toLowerCase())) {
      return res.status(400).json({ error: "Invalid or missing status value." });
    }

    const result = await pool.query(
      `UPDATE appointments 
       SET status = $1 
       WHERE id = $2 
       RETURNING *`,
      [status.toLowerCase(), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Appointment record not found." });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating appointment status:", err);
    return res.status(500).json({ error: "Failed to update appointment status." });
  }
});

// Update Clinical Notes for Appointment
app.patch("/api/appointments/:id/notes", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { clinical_notes } = req.body;

    if (clinical_notes === undefined) {
      return res.status(400).json({ error: "clinical_notes field is required." });
    }

    const result = await pool.query(
      `UPDATE appointments 
       SET clinical_notes = $1 
       WHERE id = $2 
       RETURNING *`,
      [clinical_notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Appointment record not found." });
    }

    return res.json({ message: "Clinical notes updated successfully", appointment: result.rows[0] });
  } catch (err) {
    console.error("Error updating clinical notes:", err);
    return res.status(500).json({ error: "Failed to update clinical notes." });
  }
});

// Medical Records & Prescriptions for Logged-In Patient
// Medical Records & Prescriptions & Clinical Notes for Logged-In Patient
app.get("/api/records", verifyToken, async (req, res) => {
  const patientId = parseInt(req.user?.id || req.user?.userId || req.user?.user_id, 10);

  try {
    const userResult = await pool.query("SELECT name FROM users WHERE id = $1", [patientId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User profile not found" });
    }

    const userName = userResult.rows[0].name?.trim() || "";

    // 1. Fetch Prescriptions
    const prescriptionsResult = await pool.query(
      `SELECT 
         id, 
         'prescription' AS record_type,
         medication,
         dosage,
         instructions,
         medication_details,
         status,
         created_at 
       FROM prescriptions 
       WHERE patient_id = $1 
          OR LOWER(TRIM(patient_name)) = LOWER(TRIM($2))
          OR LOWER(patient_name) LIKE LOWER($3)`,
      [patientId, userName, `%${userName}%`]
    );

    // 2. Fetch Clinical Notes from Appointments
    const clinicalNotesResult = await pool.query(
      `SELECT 
         a.id, 
         'clinical_note' AS record_type,
         a.clinical_notes AS medication_details,
         a.reason AS instructions,
         a.appointment_date AS created_at,
         d.name AS doctor_name
       FROM appointments a
       LEFT JOIN users d ON a.doctor_id = d.id
       WHERE a.patient_id = $1 
         AND a.clinical_notes IS NOT NULL 
         AND TRIM(a.clinical_notes) != ''`,
      [patientId]
    );

    // Combine and sort by date descending
    const combinedRecords = [
      ...prescriptionsResult.rows,
      ...clinicalNotesResult.rows
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return res.json(combinedRecords);
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

// POST New Prescription (Handles both /api/prescriptions & /api/doctor/prescriptions)
const createPrescriptionHandler = async (req, res) => {
  let { appointment_id, patient_id, patient_name, medication, dosage, instructions, medication_details } = req.body;
  const doctorId = parseInt(req.user?.id || req.user?.userId || req.user?.user_id, 10);

  const finalMedicationDetails = medication_details || [medication, dosage, instructions].filter(Boolean).join(" - ") || medication || "Prescription Details";

  if (!finalMedicationDetails && !medication) {
    return res.status(400).json({ error: "Medication details or medication name is required." });
  }

  try {
    let resolvedPatientName = patient_name ? String(patient_name).trim() : null;
    let safePatientId = patient_id && !isNaN(parseInt(patient_id, 10)) ? parseInt(patient_id, 10) : null;

    if ((!resolvedPatientName || !safePatientId) && appointment_id) {
      const aptRes = await pool.query("SELECT patient_name, patient_id FROM appointments WHERE id = $1", [appointment_id]);
      if (aptRes.rows.length > 0) {
        if (!resolvedPatientName && aptRes.rows[0].patient_name) resolvedPatientName = aptRes.rows[0].patient_name;
        if (!safePatientId && aptRes.rows[0].patient_id) safePatientId = aptRes.rows[0].patient_id;
      }
    }

    if (!resolvedPatientName && safePatientId) {
      const pRes = await pool.query("SELECT name FROM users WHERE id = $1", [safePatientId]);
      if (pRes.rows.length > 0 && pRes.rows[0].name) {
        resolvedPatientName = pRes.rows[0].name;
      }
    }

    if (!safePatientId && resolvedPatientName) {
      const userRes = await pool.query(
        "SELECT id FROM users WHERE LOWER(TRIM(name)) = LOWER(TRIM($1)) LIMIT 1",
        [resolvedPatientName]
      );
      if (userRes.rows.length > 0) {
        safePatientId = userRes.rows[0].id;
      }
    }

    const finalName = resolvedPatientName && resolvedPatientName.trim() !== "" ? resolvedPatientName : "Anonymous Patient";

    const result = await pool.query(
      `INSERT INTO prescriptions (appointment_id, doctor_id, patient_id, patient_name, medication, dosage, instructions, medication_details, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'issued') 
       RETURNING *`,
      [
        appointment_id || null,
        doctorId,
        safePatientId,
        finalName,
        medication || null,
        dosage || null,
        instructions || null,
        finalMedicationDetails
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating prescription:", err);
    res.status(500).json({ error: "Server error saving prescription.", details: err.message });
  }
};

app.post("/api/prescriptions", verifyToken, createPrescriptionHandler);
app.post("/api/doctor/prescriptions", verifyToken, createPrescriptionHandler);

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

    const userResult = await pool.query("SELECT name FROM users WHERE id = $1", [patient_id]);
    const patient_name = userResult.rows[0]?.name || "Anonymous Patient";

    let { department, doctor_id, doctor_name, appointment_date, appointment_time, reason } = req.body;

    if (!appointment_date || !appointment_time) {
      return res.status(400).json({ error: "Date and time are required." });
    }

    if (appointment_time && appointment_time.length === 5) {
      appointment_time = `${appointment_time}:00`;
    }

    let safeDoctorId = doctor_id && !isNaN(parseInt(doctor_id, 10)) ? parseInt(doctor_id, 10) : null;

    const searchTarget = doctor_name || (isNaN(parseInt(doctor_id, 10)) ? doctor_id : null);
    
    if (searchTarget && !safeDoctorId) {
      const cleanName = String(searchTarget).replace(/^dr\.\s*/i, '').trim();
      const docRes = await pool.query(
        `SELECT id FROM users 
         WHERE LOWER(role) = 'doctor' 
           AND (LOWER(name) LIKE LOWER($1) OR id::text = $2) 
         ORDER BY id DESC 
         LIMIT 1`,
        [`%${cleanName}%`, cleanName]
      );
      
      if (docRes.rows.length > 0) {
        safeDoctorId = docRes.rows[0].id;
      }
    }

    if (safeDoctorId) {
      const collisionCheck = await pool.query(
        `SELECT id FROM appointments 
         WHERE doctor_id = $1 
           AND appointment_date = $2::date 
           AND appointment_time = $3::time 
           AND LOWER(status) NOT IN ('cancelled', 'rejected')`,
        [safeDoctorId, appointment_date, appointment_time]
      );

      if (collisionCheck.rows.length > 0) {
        return res.status(409).json({ 
          error: "This time slot is already booked for this doctor. Please select a different time." 
        });
      }
    }

    const safeDept = department || "General Medicine";
    const safeReason = reason || "";

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

// Filtered Appointments for Doctors
app.get("/api/appointments/doctor", verifyToken, async (req, res) => {
  try {
    let doctor_id = parseInt(req.user?.id || req.user?.userId || req.user?.user_id, 10);
    const user_role = req.user?.role?.toLowerCase();

    if (user_role !== "doctor") {
      return res.status(403).json({ error: "Access denied. Restricted to medical professionals." });
    }

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
      `SELECT a.*, 
              COALESCE(u.name, a.patient_name, 'Anonymous Patient') as patient_name, 
              u.phone 
       FROM appointments a
       LEFT JOIN users u ON a.patient_id = u.id
       WHERE a.doctor_id = $1 
       ORDER BY a.created_at DESC, a.appointment_date DESC, a.appointment_time DESC`,
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
        clinical_notes TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS prescriptions (
        id SERIAL PRIMARY KEY,
        appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
        doctor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        patient_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        patient_name VARCHAR(255) DEFAULT 'Anonymous Patient',
        medication VARCHAR(255),
        dosage VARCHAR(255),
        instructions TEXT,
        medication_details TEXT,
        status VARCHAR(50) DEFAULT 'issued',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

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
      "ALTER TABLE appointments ADD COLUMN IF NOT EXISTS clinical_notes TEXT;",
      "ALTER TABLE appointments ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';",
      "ALTER TABLE appointments ALTER COLUMN appointment_time TYPE TIME USING appointment_time::time;",
      "ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL;",
      "ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS patient_id INTEGER REFERENCES users(id) ON DELETE SET NULL;",
      "ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS medication VARCHAR(255);",
      "ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS dosage VARCHAR(255);",
      "ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS instructions TEXT;",
      "ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS medication_details TEXT;",
      "ALTER TABLE prescriptions ALTER COLUMN patient_name DROP NOT NULL;",
      "ALTER TABLE prescriptions ALTER COLUMN patient_name SET DEFAULT 'Anonymous Patient';",
      "ALTER TABLE prescriptions ALTER COLUMN medication_details DROP NOT NULL;"
    ];

    for (const query of migrations) { 
      await pool.query(query); 
    }

    console.log("✅ PostgreSQL schema ready and updated with all migrations.");
  } catch (err) {
    console.error("❌ DB INIT ERROR:", err);
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
    6️⃣ START SERVER IMMEDIATELY (FIXES RENDER TIMEOUTS)
====================== */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  initDatabase();
});