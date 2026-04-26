import express from "express";
import pool from "../utils/db.js";

const router = express.Router();

/* ================= CREATE APPOINTMENT ================= */
router.post("/", async (req, res) => {
  try {
    const { patient_name, phone, appointment_time, doctor_id, reason } = req.body;

    // 1. Validation
    if (!patient_name || !phone || !appointment_time) {
      return res.status(400).json({ error: "Missing required fields: patient_name, phone, or appointment_time" });
    }

    // 2. Safe Parsing
    const parsedDoctorId = doctor_id ? parseInt(doctor_id, 10) : null;

    // 3. Database Insertion
    const result = await pool.query(
      `INSERT INTO appointments (patient_name, phone, appointment_time, doctor_id, reason, status) 
       VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING *`,
      [patient_name, phone, appointment_time, parsedDoctorId, reason || 'General Consultation']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    // This will print the EXACT database error (e.g., "column does not exist") in Render logs
    console.error("Database Error:", err.message); 
    res.status(500).json({ 
      error: "Booking failed due to server error", 
      details: err.message 
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