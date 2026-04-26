import express from "express";
import pool from "../utils/db.js";

const router = express.Router();

/* ================= CREATE APPOINTMENT ================= */
router.post("/", async (req, res) => {
  try {
    const { patient_name, phone, appointment_time, doctor_id, reason } = req.body;

    // 1. Strict Validation
    if (!patient_name || !phone || !appointment_time) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 2. Safe Parsing (Convert "1" to 1)
    const parsedDoctorId = doctor_id ? parseInt(doctor_id, 10) : null;

    const result = await pool.query(
      `INSERT INTO appointments (patient_name, phone, appointment_time, doctor_id, reason, status) 
       VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING *`,
      [patient_name, phone, appointment_time, parsedDoctorId, reason || 'General Consultation']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    // Check your Render logs for this message!
    console.error("CRITICAL DB ERROR:", err.message); 
    res.status(500).json({ 
      error: "Booking failed", 
      details: err.message // Sending this back helps us debug faster
    });
  }
});

/* ================= GET ALL APPOINTMENTS ================= */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM appointments ORDER BY appointment_time DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch Error:", err.message);
    res.status(500).json({ error: "Could not fetch appointments" });
  }
});

// ... rest of your routes (GET :id, PUT, DELETE) remain the same
export default router;