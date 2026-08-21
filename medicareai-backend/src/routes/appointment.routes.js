import express from "express";
import jwt from "jsonwebtoken";
import pool from "../utils/db.js";

const router = express.Router();

/* Middleware to verify JWT and extract user context */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. No authentication token provided." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Session expired or token authentication failed." });
  }
};

/* ================= GET DOCTOR SPECIFIC APPOINTMENTS ================= */
router.get("/doctor", authenticateToken, async (req, res) => {
  try {
    if (req.user.role?.toLowerCase() !== "doctor") {
      return res.status(403).json({ error: "Access forbidden. Account requires doctor privileges." });
    }

    const doctorId = parseInt(req.user.id, 10);

    const result = await pool.query(
      `SELECT 
        a.*, 
        COALESCE(a.patient_name, u.name, 'Unknown Patient') AS patient_name,
        COALESCE(a.phone, u.phone, 'N/A') AS phone
       FROM appointments a
       LEFT JOIN users u ON a.patient_id = u.id
       WHERE a.doctor_id = $1
       ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
      [doctorId]
    );

    return res.json(result.rows || []);
  } catch (err) {
    console.error("Doctor Appointment Fetch Error:", err.message);
    return res.status(500).json({ error: "Could not fetch doctor appointments." });
  }
});

/* ================= CREATE APPOINTMENT ================= */
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { department, doctor_id, appointment_date, appointment_time, reason, patient_name, phone } = req.body;
    const patientId = parseInt(req.user.id, 10);

    if (!appointment_date || !appointment_time) {
      return res.status(400).json({ error: "Missing required fields: appointment_date and appointment_time." });
    }

    const parsedDoctorId = doctor_id ? parseInt(doctor_id, 10) : null;

    // Fetch patient name/phone from users table if not supplied in body
    let nameToInsert = patient_name;
    let phoneToInsert = phone;

    if (!nameToInsert || !phoneToInsert) {
      const userRes = await pool.query("SELECT name, phone FROM users WHERE id = $1", [patientId]);
      if (userRes.rows.length > 0) {
        nameToInsert = nameToInsert || userRes.rows[0].name || "Patient";
        phoneToInsert = phoneToInsert || userRes.rows[0].phone || "N/A";
      }
    }

    // Check for double booking
    if (parsedDoctorId) {
      const conflictCheck = await pool.query(
        `SELECT id FROM appointments 
         WHERE doctor_id = $1 AND appointment_date = $2 AND appointment_time = $3 AND status != 'Cancelled'`,
        [parsedDoctorId, appointment_date, appointment_time]
      );

      if (conflictCheck.rows.length > 0) {
        return res.status(409).json({ 
          error: "This time slot is already booked for the selected doctor. Please choose a different time." 
        });
      }
    }

    const result = await pool.query(
      `INSERT INTO appointments (patient_name, phone, appointment_date, appointment_time, department, doctor_id, patient_id, reason, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Confirmed') 
       RETURNING *`,
      [
        nameToInsert,
        phoneToInsert,
        appointment_date,
        appointment_time,
        department || 'General Medicine',
        parsedDoctorId,
        patientId,
        reason || 'General Consultation'
      ]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("CRITICAL DB ERROR:", err.message); 
    return res.status(500).json({ error: "Booking failed", details: err.message });
  }
});

/* ================= GET FILTERED / MY APPOINTMENTS ================= */
router.get("/", authenticateToken, async (req, res) => {
  const { patient_id, doctor_id } = req.query;

  try {
    let query = `
      SELECT 
        a.*, 
        d.name AS doctor_name,
        COALESCE(a.patient_name, u.name, 'Unknown Patient') AS patient_name,
        COALESCE(a.phone, u.phone, 'N/A') AS phone
      FROM appointments a
      LEFT JOIN users u ON a.patient_id = u.id
      LEFT JOIN users d ON a.doctor_id = d.id
    `;
    let params = [];

    // Prioritize caller's authenticated patient ID if no admin override query
    const targetPatientId = patient_id ? parseInt(patient_id, 10) : parseInt(req.user.id, 10);

    if (req.user.role?.toLowerCase() === "patient") {
      query += " WHERE a.patient_id = $1";
      params.push(targetPatientId);
    } else if (doctor_id) {
      query += " WHERE a.doctor_id = $1";
      params.push(parseInt(doctor_id, 10));
    }

    query += " ORDER BY a.appointment_date DESC, a.appointment_time DESC";
    
    const result = await pool.query(query, params);
    return res.json(result.rows);
  } catch (err) {
    console.error("Fetch Error:", err.message);
    return res.status(500).json({ error: "Could not fetch appointments" });
  }
});

/* ================= UPDATE STATUS ================= */
const handleStatusUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status value is required." });
    }

    const result = await pool.query(
      "UPDATE appointments SET status=$1 WHERE id=$2 RETURNING *",
      [status, parseInt(id, 10)]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error("Update Error:", err.message);
    return res.status(500).json({ error: "Update failed" });
  }
};

router.put("/:id", authenticateToken, handleStatusUpdate);
router.patch("/:id/status", authenticateToken, handleStatusUpdate);

/* ================= DELETE APPOINTMENT ================= */
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM appointments WHERE id=$1 RETURNING *", 
      [parseInt(req.params.id, 10)]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    return res.json({ message: "Appointment deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err.message);
    return res.status(500).json({ error: "Deletion failed" });
  }
});

export default router;