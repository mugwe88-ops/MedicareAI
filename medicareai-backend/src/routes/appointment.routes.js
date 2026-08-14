import express from "express";
import jwt from "jsonwebtoken";
import pool from "../utils/db.js";

const router = express.Router();

/* ================= GET DOCTOR SPECIFIC APPOINTMENTS ================= */
router.get("/doctor", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Access denied. No authentication token provided." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");

    if (decoded.role?.toLowerCase() !== "doctor") {
      return res.status(403).json({ error: "Access forbidden. Account requires doctor privileges." });
    }

    const doctorId = parseInt(decoded.id, 10);

    // Join with users table to fall back to registered user details if direct fields are empty
    const result = await pool.query(
      `SELECT 
        a.*, 
        COALESCE(a.patient_name, u.name, 'Unknown Patient') AS patient_name,
        COALESCE(a.phone, u.phone, 'N/A') AS phone
       FROM appointments a
       LEFT JOIN users u ON a.patient_id = u.id
       WHERE a.doctor_id = $1 OR a.doctor_id IS NULL
       ORDER BY a.appointment_time DESC`,
      [doctorId]
    );

    return res.json(result.rows || []);
  } catch (err) {
    console.error("Doctor Appointment Fetch Error:", err.message);
    return res.status(401).json({ error: "Session expired or token authentication failed." });
  }
});

/* ================= CREATE APPOINTMENT ================= */
router.post("/", async (req, res) => {
  try {
    const { patient_name, phone, appointment_time, doctor_id, reason, patient_id } = req.body;

    if (!patient_name || !phone || !appointment_time) {
      return res.status(400).json({ error: "Missing required fields: patient_name, phone, and appointment_time." });
    }

    const parsedDoctorId = doctor_id ? parseInt(doctor_id, 10) : null;
    const parsedPatientId = patient_id ? parseInt(patient_id, 10) : null;

    const result = await pool.query(
      `INSERT INTO appointments (patient_name, phone, appointment_time, doctor_id, patient_id, reason, status) 
       VALUES ($1, $2, $3, $4, $5, $6, 'Pending') 
       RETURNING *`,
      [patient_name, phone, appointment_time, parsedDoctorId, parsedPatientId, reason || 'General Consultation']
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("CRITICAL DB ERROR:", err.message); 
    return res.status(500).json({ error: "Booking failed", details: err.message });
  }
});

/* ================= GET FILTERED APPOINTMENTS ================= */
router.get("/", async (req, res) => {
  const { patient_id, doctor_id } = req.query;

  try {
    let query = `
      SELECT 
        a.*, 
        COALESCE(a.patient_name, u.name, 'Unknown Patient') AS patient_name,
        COALESCE(a.phone, u.phone, 'N/A') AS phone
      FROM appointments a
      LEFT JOIN users u ON a.patient_id = u.id
    `;
    let params = [];

    if (patient_id) {
      query += " WHERE a.patient_id = $1";
      params.push(parseInt(patient_id, 10));
    } else if (doctor_id) {
      query += " WHERE a.doctor_id = $1";
      params.push(parseInt(doctor_id, 10));
    }

    query += " ORDER BY a.appointment_time DESC";
    
    const result = await pool.query(query, params);
    return res.json(result.rows);
  } catch (err) {
    console.error("Fetch Error:", err.message);
    return res.status(500).json({ error: "Could not fetch appointments" });
  }
});

/* ================= UPDATE STATUS (Supports PUT /:id and PATCH /:id/status) ================= */
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

router.put("/:id", handleStatusUpdate);
router.patch("/:id/status", handleStatusUpdate);

/* ================= DELETE APPOINTMENT ================= */
router.delete("/:id", async (req, res) => {
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