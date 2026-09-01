/* ======================
    0️⃣ ENV & IMPORTS
====================== */
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import crypto from "crypto";

// Database & Modular Routes
import pool from "./utils/db.js";
import authRoutes from "./routes/auth.js";
import appointmentRoutes from "./routes/appointment.routes.js";
import directoryRoutes from "./routes/directory.js";
import paymentRoutes from "./routes/payments.routes.js";
import bookingRoutes from "./routes/bookings.routes.js";
import doctorRoutes from "./routes/doctors.routes.js";
import telehealthRouter from "./routes/telehealth.js"; 
import prescriptionRoutes from "./routes/prescription.routes.js";
import recordsRouter from "./routes/records.js";
import messageRoutes from './routes/messages.js';
import apiRoutes from './routes/index.js';
import { verifyToken } from "./utils/jwt.js";

/* ======================
    1️⃣ APP & SOCKET.IO INIT
====================== */
const app = express(); 
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.set("trust proxy", 1);

// Allowed origins list for production & development previews
const allowedOrigins = [
  "https://medicare-ai-two.vercel.app",
  "https://medicare-ai-yb5c.vercel.app",
  "http://localhost:3000",
];

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isAllowed =
        allowedOrigins.includes(origin) ||
        (process.env.NODE_ENV !== "production" && origin.endsWith(".github.dev")) ||
        origin.includes("localhost");
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error("Socket.io blocked by CORS policy."));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

/* ======================
    2️⃣ SECURITY & CORE MIDDLEWARE
====================== */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      const isAllowed = 
        allowedOrigins.includes(origin) || 
        (process.env.NODE_ENV !== "production" && origin.endsWith('.github.dev')) || 
        origin.includes('localhost');

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error("Blocked by CORS policy: This origin is not authorized."));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Origin", "X-Requested-With", "Accept"],
  })
);

// ✅ Explicitly handle preflight OPTIONS requests for all routes
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiter for Authentication & Sensitive Routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, 
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/auth/", authLimiter);

/* ======================
    2.2 🔒 HEALTH DATA ENCRYPTION UTILITIES (AES-256-GCM)
====================== */
const ENCRYPTION_KEY_HEX = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const KEY = Buffer.from(ENCRYPTION_KEY_HEX, 'hex');

function encryptHealthData(text) {
  if (!text) return null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  let encrypted = cipher.update(String(text), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${tag}:${encrypted}`;
}

function decryptHealthData(ciphertext) {
  if (!ciphertext || !ciphertext.includes(':')) return ciphertext;
  try {
    const parts = ciphertext.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const tag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, iv);
    decipher.setAuthTag(tag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error("Decryption failed:", err.message);
    return "[Encrypted Data Unavailable]";
  }
}

/* ======================
    2.5 ⚡ USER CONTEXT NORMALIZER (Fixes NaN / Undefined IDs)
====================== */
app.use((req, res, next) => {
  if (req.user) {
    const rawId = req.user.id || req.user.userId || req.user.user_id;
    const parsedId = rawId ? parseInt(rawId, 10) : null;
    if (parsedId && !isNaN(parsedId)) {
      req.user.id = parsedId;
      req.user.userId = parsedId;
      req.user.user_id = parsedId;
    }
  }
  next();
});

/* ======================
    3️⃣ WEBRTC SIGNALING HANDLERS
====================== */
io.on("connection", (socket) => {
  console.log("⚡ Telehealth Socket connected:", socket.id);

  socket.on("join-room", ({ roomId }) => {
    socket.join(roomId);

    const room = io.sockets.adapter.rooms.get(roomId);
    const numClients = room ? room.size : 0;

    console.log(`👤 Client ${socket.id} joined room: ${roomId} (Total: ${numClients})`);

    if (numClients > 1) {
      socket.emit("room-ready");
    }

    socket.to(roomId).emit("user-joined");
  });

  socket.on("offer", ({ roomId, offer }) => {
    socket.to(roomId).emit("offer", { offer });
  });

  socket.on("answer", ({ roomId, answer }) => {
    socket.to(roomId).emit("answer", { answer });
  });

  socket.on("ice-candidate", ({ roomId, candidate }) => {
    socket.to(roomId).emit("ice-candidate", { candidate });
  });

  socket.on("disconnect", () => {
    console.log("❌ Telehealth Socket disconnected:", socket.id);
  });
});

/* ======================
    4️⃣ API ROUTES REGISTRATION
====================== */
app.use('/api', apiRoutes);
app.use('/api/messages', messageRoutes);
app.use("/api/telehealth", telehealthRouter);
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/directory", directoryRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/doctor/prescriptions", prescriptionRoutes);
app.use("/api/records", recordsRouter);

// --- LEGAL PAGES HTML ENDPOINTS ---
app.get("/api/legal/privacy-policy", (req, res) => {
  res.send(`
    <html>
      <head><title>Privacy Policy - MediCare AI</title></head>
      <body style="font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; max-width: 800px; margin: auto;">
        <h1>Privacy Policy</h1>
        <p><strong>Effective Date:</strong> January 1, 2026</p>
        <p>At MediCare AI, we take your health privacy seriously. All personal medical data, notes, and records are encrypted utilizing military-grade AES-256-GCM encryption standards both in transit and at rest.</p>
        <h3>1. Information We Collect</h3>
        <p>We collect identification details (name, email, age, phone) and clinical data (symptom history, prescriptions, diagnostic reports) strictly required for rendering telehealth and medical consultation services.</p>
        <h3>2. Data Protection</h3>
        <p>Your records are shielded from unauthorized access. We never sell or share your individual health details with external third-party marketing services.</p>
      </body>
    </html>
  `);
});

app.get("/api/legal/terms-of-service", (req, res) => {
  res.send(`
    <html>
      <head><title>Terms of Service - MediCare AI</title></head>
      <body style="font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; max-width: 800px; margin: auto;">
        <h1>Terms of Service</h1>
        <p><strong>Effective Date:</strong> January 1, 2026</p>
        <p>Welcome to MediCare AI. By booking appointments or using our telehealth features, you agree to these terms.</p>
        <h3>1. Medical Disclaimer</h3>
        <p>MediCare AI connects patients with certified clinical professionals and uses diagnostic automation tools. Our AI symptom checker serves as a guidance utility and does not completely replace formal physical examination or emergency medical care.</p>
        <h3>2. User Accounts</h3>
        <p>You are responsible for maintaining the confidentiality of your session tokens and credentials.</p>
      </body>
    </html>
  `);
});

// --- PATIENT CONSENT FLOW ENDPOINTS ---
app.get("/api/consent", verifyToken, async (req, res) => {
  const patientId = req.user.id;
  try {
    const result = await pool.query(
      `SELECT * FROM patient_consents WHERE patient_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [patientId]
    );
    if (result.rows.length === 0) {
      return res.json({ hasConsented: false });
    }
    return res.json({ hasConsented: true, consent: result.rows[0] });
  } catch (err) {
    console.error("Error checking consent:", err);
    return res.status(500).json({ error: "Failed to check consent status." });
  }
});

app.post("/api/consent", verifyToken, async (req, res) => {
  const patientId = req.user.id;
  const { consent_given, version = "1.0" } = req.body;

  if (consent_given === undefined) {
    return res.status(400).json({ error: "consent_given field is required." });
  }

  try {
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const result = await pool.query(
      `INSERT INTO patient_consents (patient_id, consent_given, version, ip_address, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [patientId, !!consent_given, version, ipAddress]
    );
    return res.status(201).json({ message: "Consent recorded successfully", consent: result.rows[0] });
  } catch (err) {
    console.error("Error saving consent:", err);
    return res.status(500).json({ error: "Failed to save consent choice." });
  }
});

app.get('/api/patient/medical-records', verifyToken, async (req, res) => {
  try {
    const patientId = req.user.id; 
    
    const result = await pool.query(
      'SELECT * FROM medical_records WHERE patient_id = $1', 
      [patientId]
    );

    const decryptedRecords = result.rows.map(record => ({
      ...record,
      clinical_notes: decryptHealthData(record.clinical_notes),
      instructions: decryptHealthData(record.instructions)
    }));

    res.json(decryptedRecords);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET Logged-In Doctor Availability Slots
app.get("/api/doctor/availability", verifyToken, async (req, res) => {
  const doctorId = req.user?.id || req.user?.userId || req.user?.user_id;
  try {
    const result = await pool.query(
      `SELECT * FROM doctor_availability WHERE doctor_id = $1 ORDER BY id DESC`,
      [doctorId]
    );
    return res.json(result.rows);
  } catch (err) {
    console.error("Error fetching availability slots:", err);
    return res.status(500).json({ error: "Failed to fetch availability slots." });
  }
});

// POST Add Doctor Availability Slot (Logged-In Doctor)
app.post("/api/doctor/availability", verifyToken, async (req, res) => {
  const doctorId = req.user?.id || req.user?.userId || req.user?.user_id;
  const { day_of_week, start_time, end_time } = req.body;

  if (!day_of_week || !start_time || !end_time) {
    return res.status(400).json({ error: "Day of week, start time, and end time are required." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [doctorId, day_of_week, start_time, end_time]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error adding availability slot:", err);
    return res.status(500).json({ error: "Failed to save availability slot.", details: err.message });
  }
});

// GET Doctor Availability Slots by ID
app.get("/api/doctors/:id/availability", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM doctor_availability WHERE doctor_id = $1 ORDER BY id DESC`,
      [id]
    );
    return res.json(result.rows);
  } catch (err) {
    console.error("Error fetching availability slots:", err);
    return res.status(500).json({ error: "Failed to fetch availability slots." });
  }
});

// POST Add Doctor Availability Slot by ID
app.post("/api/doctors/:id/availability", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { day_of_week, start_time, end_time } = req.body;

  if (!day_of_week || !start_time || !end_time) {
    return res.status(400).json({ error: "Day of week, start time, and end time are required." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id, day_of_week, start_time, end_time]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error adding availability slot:", err);
    return res.status(500).json({ error: "Failed to save availability slot.", details: err.message });
  }
});

// Express route for /api/doctors/me
// Express route for /api/doctors/me
app.get("/api/doctors/me", verifyToken, async (req, res) => {
  try {
    // Extract ID safely from decoded JWT payload
    const userId = req.user?.id || req.user?.userId || req.user?.doctorId;

    console.log("Fetching profile for authenticated user ID:", userId);

    if (!userId) {
      return res.status(401).json({ message: "Invalid or missing user ID in token payload." });
    }

    // Query doctor by either primary key (id) OR foreign key (user_id)
    const result = await db.query(
      "SELECT * FROM doctors WHERE id::text = $1 OR user_id::text = $1", 
      [String(userId)]
    );

    if (!result || !result.rows || result.rows.length === 0) {
      return res.status(404).json({ message: "Doctor record not found." });
    }

    return res.status(200).json({ doctor: result.rows[0] });
  } catch (error) {
    // This log will print the exact database error in your Render dashboard logs
    console.error("Database query crash in /api/doctors/me:", error);
    return res.status(500).json({ 
      message: "Internal server error while fetching doctor profile.",
      error: error.message 
    });
  }
});

// Get Patient Personal & Clinical Profile
app.get("/api/user/profile", verifyToken, async (req, res) => {
  const userId = parseInt(req.user?.id || req.user?.userId || req.user?.user_id, 10);

  try {
    const result = await pool.query(
      `SELECT id, name, email, age, phone, medical_history 
       FROM users 
       WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User profile not found" });
    }

    const profile = result.rows[0];
    profile.medical_history = decryptHealthData(profile.medical_history);

    return res.json(profile);
  } catch (err) {
    console.error("Error fetching profile:", err);
    return res.status(500).json({ error: "Server error fetching profile", details: err.message });
  }
});

// AI Symptom Checker Route
app.post("/api/ai/symptom-checker", async (req, res) => {
  try {
    const { symptoms } = req.body;
    if (!symptoms) {
      return res.status(400).json({ error: "Symptoms description is required" });
    }

    const aiAnalysis = {
      triageLevel: "Moderate",
      recommendedDepartment: "Cardiology",
      summary: "Based on your description, you are experiencing symptoms associated with...",
      recommendations: [
        "Schedule an appointment with a specialist",
        "Monitor your vital signs closely"
      ]
    };

    return res.json(aiAnalysis);
  } catch (err) {
    console.error("AI Symptom Checker Error:", err);
    return res.status(500).json({ error: "Failed to analyze symptoms" });
  }
});

// GET All Active Doctors
app.get("/api/doctors", async (req, res) => {
  try {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    
    const { specialization } = req.query;

    let query = `
      SELECT 
        id, 
        name, 
        COALESCE(NULLIF(TRIM(specialization), ''), 'General Medicine') AS specialization, 
        city, 
        status,
        email
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

// DELETE Doctor Availability Slot
app.delete("/api/doctor/availability/:id", verifyToken, async (req, res) => {
  const doctorId = req.user?.id || req.user?.userId || req.user?.user_id;
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM doctor_availability WHERE id = $1 AND doctor_id = $2 RETURNING *",
      [id, doctorId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Availability slot not found or unauthorized." });
    }

    return res.json({ message: "Slot deleted successfully.", deletedSlot: result.rows[0] });
  } catch (err) {
    console.error("Error deleting availability slot:", err);
    return res.status(500).json({ error: "Failed to delete availability slot." });
  }
});

// Update Patient Personal & Clinical Profile
app.put("/api/user/profile", verifyToken, async (req, res) => {
  const userId = parseInt(req.user?.id || req.user?.userId || req.user?.user_id, 10);
  const { age, phone, medical_history } = req.body;

  try {
    const encryptedHistory = encryptHealthData(medical_history);
    const updateRes = await pool.query(
      `UPDATE users 
       SET age = COALESCE($1, age), 
           phone = COALESCE($2, phone), 
           medical_history = COALESCE($3, medical_history) 
       WHERE id = $4 
       RETURNING id, name, email, age, phone, medical_history`,
      [age ? parseInt(age, 10) : null, phone, encryptedHistory, userId]
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ error: "User profile not found" });
    }

    const updatedUser = updateRes.rows[0];
    updatedUser.medical_history = decryptHealthData(updatedUser.medical_history);

    return res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    console.error("Error updating profile:", err);
    return res.status(500).json({ error: "Server error updating profile", details: err.message });
  }
});

// Update doctor availability status
app.put("/api/doctor/availability", verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['available', 'scheduled', 'break'].includes(status)) {
      return res.status(400).json({ error: "Invalid availability status" });
    }

    const result = await pool.query(
      `UPDATE users SET availability_status = $1 WHERE id = $2 RETURNING id, name, availability_status`,
      [status, req.user.userId || req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    res.json({ message: "Availability updated successfully", user: result.rows[0] });
  } catch (err) {
    console.error("Error updating availability:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET All Active Doctors List Alias
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

// Update Appointment Status
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

    const apt = result.rows[0];
    apt.clinical_notes = decryptHealthData(apt.clinical_notes);
    return res.json(apt);
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

    const encryptedNotes = encryptHealthData(clinical_notes);
    const result = await pool.query(
      `UPDATE appointments 
       SET clinical_notes = $1 
       WHERE id = $2 
       RETURNING *`,
      [encryptedNotes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Appointment record not found." });
    }

    const apt = result.rows[0];
    apt.clinical_notes = decryptHealthData(apt.clinical_notes);
    return res.json({ message: "Clinical notes updated successfully", appointment: apt });
  } catch (err) {
    console.error("Error updating clinical notes:", err);
    return res.status(500).json({ error: "Failed to update clinical notes." });
  }
});

// Medical Records for Logged-In Patient
app.get("/api/records", verifyToken, async (req, res) => {
  const userId = req.user?.id;
  if (!userId || isNaN(userId)) {
    return res.status(400).json({ error: "Invalid user session or ID." });
  }
  const patientId = parseInt(userId, 10);

  try {
    const userResult = await pool.query("SELECT id, name, age FROM users WHERE id = $1", [patientId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User profile not found" });
    }

    const patientUser = userResult.rows[0];
    const patientAge = patientUser.age || "N/A";
    const patientNumber = `SMD-${1000 + patientUser.id}`;

    // 1. Fetch Prescriptions
    const prescriptionsResult = await pool.query(
      `SELECT 
          p.id, 
          'prescription' AS record_type,
          COALESCE(NULLIF(TRIM(u.name), ''), NULLIF(TRIM(p.patient_name), ''), NULLIF(TRIM(apt_u.name), ''), $2, 'Valued Patient') AS patient_name,
          ${patientAge !== "N/A" ? patientAge : "NULL"} AS patient_age,
          '${patientNumber}' AS patient_number,
          p.medication_details,
          p.instructions,
          p.status,
          p.created_at,
          (SELECT name FROM users WHERE id = p.doctor_id) AS doctor_name
        FROM prescriptions p
        LEFT JOIN users u ON p.patient_id = u.id
        LEFT JOIN appointments a ON p.appointment_id = a.id
        LEFT JOIN users apt_u ON a.patient_id = apt_u.id
        WHERE p.patient_id = $1 OR p.appointment_id IN (SELECT id FROM appointments WHERE patient_id = $1) OR p.patient_id IS NULL`,
      [patientId, patientUser.name]
    );

    // 2. Fetch Clinical Notes
    const clinicalNotesResult = await pool.query(
      `SELECT 
          a.id, 
          'clinical_note' AS record_type,
          COALESCE(NULLIF(TRIM(u.name), ''), NULLIF(TRIM(a.patient_name), ''), $2, 'Valued Patient') AS patient_name,
          ${patientAge !== "N/A" ? patientAge : "NULL"} AS patient_age,
          '${patientNumber}' AS patient_number,
          a.clinical_notes AS medication_details,
          a.reason AS instructions,
          a.appointment_date AS created_at,
          d.name AS doctor_name
        FROM appointments a
        LEFT JOIN users u ON a.patient_id = u.id
        LEFT JOIN users d ON a.doctor_id = d.id
        WHERE a.patient_id = $1 
          AND a.clinical_notes IS NOT NULL 
          AND TRIM(a.clinical_notes) != ''`,
      [patientId, patientUser.name]
    );

    // 3. Fetch Diagnostics / Lab Results
    const diagnosticsResult = await pool.query(
      `SELECT 
          dg.id, 
          'diagnostic' AS record_type,
          COALESCE(NULLIF(TRIM(u.name), ''), NULLIF(TRIM(dg.patient_name), ''), $2, 'Valued Patient') AS patient_name,
          ${patientAge !== "N/A" ? patientAge : "NULL"} AS patient_age,
          '${patientNumber}' AS patient_number,
          CONCAT(dg.category, ': ', dg.test_name) AS medication_details,
          dg.clinical_instructions AS instructions,
          dg.status,
          dg.created_at,
          d.name AS doctor_name
        FROM diagnostics dg
        LEFT JOIN users u ON dg.patient_id = u.id
        LEFT JOIN users d ON dg.doctor_id = d.id
        WHERE dg.patient_id = $1 OR dg.appointment_id IN (SELECT id FROM appointments WHERE patient_id = $1)`,
      [patientId, patientUser.name]
    );

    const decryptRecords = (rows) => rows.map(r => ({
      ...r,
      medication_details: decryptHealthData(r.medication_details),
      instructions: decryptHealthData(r.instructions)
    }));

    const combinedRecords = [
      ...decryptRecords(prescriptionsResult.rows),
      ...decryptRecords(clinicalNotesResult.rows),
      ...decryptRecords(diagnosticsResult.rows)
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

    const decrypted = result.rows.map(p => ({
      ...p,
      medication_details: decryptHealthData(p.medication_details),
      instructions: decryptHealthData(p.instructions)
    }));

    return res.json(decrypted);
  } catch (err) {
    console.error("Error fetching prescriptions:", err);
    return res.status(500).json({ error: "Server error fetching prescriptions." });
  }
});

// GET List of Patients
app.get("/api/patients", verifyToken, async (req, res) => {
  try {
    const user_role = req.user?.role?.toLowerCase();
    if (user_role !== "doctor") {
      return res.status(403).json({ error: "Access denied. Restricted to medical professionals." });
    }

    const result = await pool.query(
      `SELECT id, name, email FROM users WHERE LOWER(role) = 'patient' ORDER BY name ASC`
    );

    return res.json(result.rows || []);
  } catch (err) {
    console.error("Error fetching patients list:", err);
    return res.status(500).json({ error: "Failed to fetch patients list." });
  }
});

// GET Diagnostics by Appointment ID
app.get("/api/appointments/:appointmentId/diagnostics", verifyToken, async (req, res) => {
  const { appointmentId } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM diagnostics 
       WHERE appointment_id = $1 
       ORDER BY created_at DESC`,
      [appointmentId]
    );
    const decrypted = result.rows.map(d => ({
      ...d,
      clinical_instructions: decryptHealthData(d.clinical_instructions)
    }));
    return res.json(decrypted);
  } catch (err) {
    console.error("Error fetching appointment diagnostics:", err);
    return res.status(500).json({ error: "Failed to fetch diagnostics for this appointment." });
  }
});

// GET Prescriptions by Appointment ID
app.get("/api/appointments/:appointmentId/prescriptions", verifyToken, async (req, res) => {
  const { appointmentId } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM prescriptions 
       WHERE appointment_id = $1 
       ORDER BY created_at DESC`,
      [appointmentId]
    );
    const decrypted = result.rows.map(p => ({
      ...p,
      medication_details: decryptHealthData(p.medication_details),
      instructions: decryptHealthData(p.instructions)
    }));
    return res.json(decrypted);
  } catch (err) {
    console.error("Error fetching appointment prescriptions:", err);
    return res.status(500).json({ error: "Failed to fetch prescriptions for this appointment." });
  }
});

// POST New Prescription Handler
const createPrescriptionHandler = async (req, res) => {
  let { appointment_id, patient_id, patient_name, medication, dosage, instructions, medication_details } = req.body;
  const doctorId = parseInt(req.user?.id || req.user?.userId || req.user?.user_id, 10);

  const rawMedDetails = medication_details || [medication, dosage, instructions].filter(Boolean).join(" - ") || medication || "Prescription Details";

  if (!rawMedDetails && !medication) {
    return res.status(400).json({ error: "Medication details or medication name is required." });
  }

  try {
    let resolvedPatientName = patient_name ? String(patient_name).trim() : null;
    let safePatientId = patient_id && !isNaN(parseInt(patient_id, 10)) ? parseInt(patient_id, 10) : null;

    if ((!resolvedPatientName || !safePatientId) && appointment_id) {
      const aptRes = await pool.query(
        `SELECT a.patient_name, a.patient_id, u.name as user_name 
         FROM appointments a 
         LEFT JOIN users u ON a.patient_id = u.id 
         WHERE a.id = $1`, 
        [appointment_id]
      );
      if (aptRes.rows.length > 0) {
        if (!resolvedPatientName) resolvedPatientName = aptRes.rows[0].user_name || aptRes.rows[0].patient_name;
        if (!safePatientId) safePatientId = aptRes.rows[0].patient_id;
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
        "SELECT id FROM users WHERE LOWER(TRIM(name)) LIKE LOWER(TRIM($1)) LIMIT 1",
        [`%${resolvedPatientName}%`]
      );
      if (userRes.rows.length > 0) {
        safePatientId = userRes.rows[0].id;
      }
    }

    const finalName = resolvedPatientName && resolvedPatientName.trim() !== "" ? resolvedPatientName : "Valued Patient";
    const encryptedMedDetails = encryptHealthData(rawMedDetails);
    const encryptedInstructions = encryptHealthData(instructions);

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
        encryptedInstructions,
        encryptedMedDetails
      ]
    );

    const saved = result.rows[0];
    saved.medication_details = decryptHealthData(saved.medication_details);
    saved.instructions = decryptHealthData(saved.instructions);

    return res.status(201).json(saved);
  } catch (err) {
    console.error("Error creating prescription:", err);
    return res.status(500).json({ error: "Server error saving prescription.", details: err.message });
  }
};

app.post("/api/prescriptions", verifyToken, createPrescriptionHandler);
app.post("/api/doctor/prescriptions", verifyToken, createPrescriptionHandler);

app.use("/api/doctor", doctorRoutes);

// Filtered Appointments for Logged-In Patients
app.get("/api/my-appointments", verifyToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user session or ID." });
    }
    const patient_id = parseInt(userId, 10);

    const result = await pool.query(
      `SELECT a.*, d.name as doctor_name 
       FROM appointments a 
       LEFT JOIN users d ON a.doctor_id = d.id 
       WHERE a.patient_id = $1 
       ORDER BY a.created_at DESC`,
      [patient_id]
    );

    const decryptedList = result.rows.map(apt => ({
      ...apt,
      clinical_notes: decryptHealthData(apt.clinical_notes),
      patient_chronic_conditions: decryptHealthData(apt.patient_chronic_conditions),
      patient_allergies: decryptHealthData(apt.patient_allergies),
      patient_surgeries: decryptHealthData(apt.patient_surgeries)
    }));

    return res.json(decryptedList);
  } catch (err) {
    console.error("Error fetching filtered appointments:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Add this inside src/routes/doctors.routes.js or your main server file

// Reusable Appointment Booking Controller Handler
const createAppointmentHandler = async (req, res) => {
  try {
    const rawId = req.user?.id || req.user?.userId || req.user?.user_id;
    const patient_id = parseInt(rawId, 10);

    if (!patient_id || isNaN(patient_id)) {
      return res.status(400).json({ error: "Invalid user session. Please re-login." });
    }

    const userResult = await pool.query("SELECT name FROM users WHERE id = $1", [patient_id]);
    const patient_name = userResult.rows[0]?.name || "Valued Patient";

    let { 
      department, 
      doctor_id, 
      doctor_name, 
      appointment_date, 
      appointment_time, 
      reason,
      patient_chronic_conditions,
      patient_allergies,
      patient_surgeries 
    } = req.body;

    if (!appointment_date || !appointment_time) {
      return res.status(400).json({ error: "Date and time are required." });
    }

    const query = `
      INSERT INTO appointments (
        patient_id, patient_name, department, doctor_id, doctor_name, 
        appointment_date, appointment_time, reason, 
        patient_chronic_conditions, patient_allergies, patient_surgeries, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending', NOW())
      RETURNING *;
    `;

    const values = [
      patient_id,
      patient_name,
      department || 'General Medicine',
      doctor_id || null,
      doctor_name || 'Assigned Specialist',
      appointment_date,
      appointment_time,
      encryptHealthData(reason),
      encryptHealthData(patient_chronic_conditions),
      encryptHealthData(patient_allergies),
      encryptHealthData(patient_surgeries)
    ];

    const newAppointment = await pool.query(query, values);
    const apt = newAppointment.rows[0];
    apt.reason = decryptHealthData(apt.reason);
    apt.patient_chronic_conditions = decryptHealthData(apt.patient_chronic_conditions);
    apt.patient_allergies = decryptHealthData(apt.patient_allergies);
    apt.patient_surgeries = decryptHealthData(apt.patient_surgeries);

    return res.status(201).json(apt);
  } catch (err) {
    console.error("Booking Error:", err);
    return res.status(500).json({ error: "Failed to book appointment." });
  }
};

app.post("/api/bookings", verifyToken, createAppointmentHandler);

/* ======================
    5️⃣ SERVER LISTENER
====================== */
httpServer.listen(PORT, () => {
  console.log(`🚀 MediCare AI Server running on port ${PORT}`);
});