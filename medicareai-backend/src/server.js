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
    2️⃣ FAIL-SAFE CORS & MIDDLEWARE
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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiter for Authentication & Sensitive Routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/auth/", authLimiter);

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

    // Notify joining user if someone is already in the room
    if (numClients > 1) {
      socket.emit("room-ready");
    }

    // Inform existing participants that someone joined
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
    4️⃣ API ROUTES
====================== */
app.use("/api/telehealth", telehealthRouter);
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/directory", directoryRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/doctor/prescriptions", prescriptionRoutes);

// POST Submit Diagnostic Order

// POST Submit Diagnostic Order (Alias for frontend compatibility)
app.post("/api/diagnostics", verifyToken, async (req, res) => {
  const doctorId = parseInt(req.user?.id || req.user?.userId || req.user?.user_id, 10);
  const { appointment_id, patient_id, patient_name, category, test_name, clinical_instructions } = req.body;

  if (!test_name) {
    return res.status(400).json({ error: "Test name is required." });
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

    const finalName = resolvedPatientName || "Valued Patient";

    const result = await pool.query(
      `INSERT INTO diagnostics (appointment_id, doctor_id, patient_id, patient_name, category, test_name, clinical_instructions, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'ordered')
       RETURNING *`,
      [
        appointment_id || null,
        doctorId,
        safePatientId,
        finalName,
        category || 'Laboratory Test',
        test_name,
        clinical_instructions || null
      ]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error submitting diagnostic order:", err);
    return res.status(500).json({ error: "Failed to submit diagnostic order.", details: err.message });
  }
});

app.post("/api/doctor/diagnostics", verifyToken, async (req, res) => {
  const doctorId = parseInt(req.user?.id || req.user?.userId || req.user?.user_id, 10);
  const { appointment_id, patient_id, patient_name, category, test_name, clinical_instructions } = req.body;

  if (!test_name) {
    return res.status(400).json({ error: "Test name is required." });
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

    const finalName = resolvedPatientName || "Valued Patient";

    const result = await pool.query(
      `INSERT INTO diagnostics (appointment_id, doctor_id, patient_id, patient_name, category, test_name, clinical_instructions, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'ordered')
       RETURNING *`,
      [
        appointment_id || null,
        doctorId,
        safePatientId,
        finalName,
        category || 'Laboratory Test',
        test_name,
        clinical_instructions || null
      ]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error submitting diagnostic order:", err);
    return res.status(500).json({ error: "Failed to submit diagnostic order.", details: err.message });
  }
});

// GET Logged-In Doctor Availability Slots (Singular Endpoint)
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

// POST Add Doctor Availability Slot (Logged-In Doctor - Singular Endpoint)
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

app.post('/api/appointments', async (req, res) => {
  try {
    const {
      doctorId,
      bodySystem,
      symptomSeverity,
      symptomDuration,
      reasonForVisit,
      patient_chronic_conditions,
      patient_allergies,
      patient_surgeries,
      patient_id
    } = req.body;

    const query = `
      INSERT INTO appointments (
        doctor_id, patient_id, body_system, symptom_severity, 
        symptom_duration, reason_for_visit, 
        patient_chronic_conditions, patient_allergies, patient_surgeries, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING *;
    `;

    const values = [
      doctorId, patient_id, bodySystem, symptomSeverity,
      symptomDuration, reasonForVisit,
      patient_chronic_conditions, patient_allergies, patient_surgeries
    ];

    const newAppointment = await pool.query(query, values);
    res.status(201).json(newAppointment.rows[0]);
  } catch (err) {
    console.error("Booking Error:", err);
    res.status(500).json({ error: "Failed to book appointment" });
  }
});

// GET Doctor Availability Slots
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

// POST Add Doctor Availability Slot
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

    return res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching profile:", err);
    return res.status(500).json({ error: "Server error fetching profile", details: err.message });
  }
});

// DELETE Doctor Availability Slot (Singular Endpoint)
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
    const updateRes = await pool.query(
      `UPDATE users 
       SET age = COALESCE($1, age), 
           phone = COALESCE($2, phone), 
           medical_history = COALESCE($3, medical_history) 
       WHERE id = $4 
       RETURNING id, name, email, age, phone, medical_history`,
      [age ? parseInt(age, 10) : null, phone, medical_history, userId]
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ error: "User profile not found" });
    }

    return res.json({ message: "Profile updated successfully", user: updateRes.rows[0] });
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

// GET All Active Doctors
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

    return res.json(result.rows);
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
    return res.json(result.rows);
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
    return res.json(result.rows);
  } catch (err) {
    console.error("Error fetching appointment prescriptions:", err);
    return res.status(500).json({ error: "Failed to fetch prescriptions for this appointment." });
  }
});

// POST New Prescription Handler
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

    return res.status(201).json(result.rows[0]);
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
    return res.json(result.rows);
  } catch (err) {
    console.error("Error fetching filtered appointments:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

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
    const safeConditions = patient_chronic_conditions || "None";
    const safeAllergies = patient_allergies || "None";
    const safeSurgeries = patient_surgeries || "None";

    const query = `
      INSERT INTO appointments (
        patient_id, patient_name, doctor_id, department, 
        appointment_date, appointment_time, reason, 
        patient_chronic_conditions, patient_allergies, patient_surgeries, status
      )
      VALUES ($1, $2, $3, $4, $5::date, $6::time, $7, $8, $9, $10, 'confirmed')
      RETURNING *;
    `;

    const result = await pool.query(query, [
      patient_id,
      patient_name,
      safeDoctorId,
      safeDept,
      appointment_date,
      appointment_time,
      safeReason,
      safeConditions,
      safeAllergies,
      safeSurgeries
    ]);

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ DB Insert Error on appointment handler:", err);
    return res.status(500).json({ 
      error: "Failed to book appointment.", 
      details: err.message || "Database query failure" 
    });
  }
};

// Aliased Route Definitions
app.post("/api/my-appointments", verifyToken, createAppointmentHandler);
app.post("/api/appointments/book", verifyToken, createAppointmentHandler);

// Filtered Appointments for Doctors (Updated to target unified users table)
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
              COALESCE(u.name, a.patient_name, 'Valued Patient') as patient_name, 
              u.phone, 
              u.age, 
              u.medical_history,
              a.patient_chronic_conditions,
              a.patient_allergies,
              a.patient_surgeries
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
  return res.json({ status: "ok", message: "API is running" });
});

/* ======================
    5️⃣ DATABASE INIT & MIGRATIONS
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
        patient_chronic_conditions TEXT,
        patient_allergies TEXT,
        patient_surgeries TEXT,
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
        patient_name VARCHAR(255) DEFAULT 'Valued Patient',
        medication VARCHAR(255),
        dosage VARCHAR(255),
        instructions TEXT,
        medication_details TEXT,
        status VARCHAR(50) DEFAULT 'issued',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS diagnostics (
        id SERIAL PRIMARY KEY,
        appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
        doctor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        patient_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        patient_name VARCHAR(255) DEFAULT 'Valued Patient',
        category VARCHAR(100),
        test_name VARCHAR(255),
        clinical_instructions TEXT,
        status VARCHAR(50) DEFAULT 'ordered',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS doctor_availability (
        id SERIAL PRIMARY KEY,
        doctor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        day_of_week VARCHAR(20) NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const migrations = [
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS specialization VARCHAR(255);",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS license_number VARCHAR(255);",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(255);",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS age INTEGER;",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS medical_history TEXT;",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Available';",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS availability_status VARCHAR(50) DEFAULT 'available';",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token TEXT;",
      "ALTER TABLE appointments ADD COLUMN IF NOT EXISTS department VARCHAR(100);",
      "ALTER TABLE appointments ADD COLUMN IF NOT EXISTS doctor_id INTEGER REFERENCES users(id) ON DELETE SET NULL;",
      "ALTER TABLE appointments ADD COLUMN IF NOT EXISTS appointment_date DATE;",
      "ALTER TABLE appointments ADD COLUMN IF NOT EXISTS appointment_time TIME;",
      "ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reason TEXT;",
      "ALTER TABLE appointments ADD COLUMN IF NOT EXISTS clinical_notes TEXT;",
      "ALTER TABLE appointments ADD COLUMN IF NOT EXISTS patient_chronic_conditions TEXT;",
      "ALTER TABLE appointments ADD COLUMN IF NOT EXISTS patient_allergies TEXT;",
      "ALTER TABLE appointments ADD COLUMN IF NOT EXISTS patient_surgeries TEXT;",
      "ALTER TABLE appointments ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';",
      "ALTER TABLE appointments ALTER COLUMN appointment_time TYPE TIME USING appointment_time::time;",
      "ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL;",
      "ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS patient_id INTEGER REFERENCES users(id) ON DELETE SET NULL;",
      "ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS medication VARCHAR(255);",
      "ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS dosage VARCHAR(255);",
      "ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS instructions TEXT;",
      "ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS medication_details TEXT;",
      "ALTER TABLE prescriptions ALTER COLUMN patient_name DROP NOT NULL;",
      "ALTER TABLE prescriptions ALTER COLUMN patient_name SET DEFAULT 'Valued Patient';",
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
    6️⃣ STATIC & CATCH-ALL (MUST BE AT THE VERY END)
====================== */
const publicPath = path.join(__dirname, "../public");
app.use(express.static(publicPath));

// Use a new variable name to avoid constant re-assignment conflicts
const portToUse = process.env.PORT || PORT || 3000;

initDatabase().then(() => {
  httpServer.listen(portToUse, () => {
    console.log(`Server is running on port ${portToUse}`);
  });
});
