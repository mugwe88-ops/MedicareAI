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

    // 2. Safe Parsing (Ensures doctor_id is a number or null)
    const parsedDoctorId = doctor_id ? parseInt(doctor_id, 10) : null;

    // Log the attempt for debugging in Render
    console.log(`Attempting booking for: ${patient_name} at ${appointment_time}`);

    const result = await pool.query(
      `INSERT INTO appointments (patient_name, phone, appointment_time, doctor_id, reason, status) 
       VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING *`,
      [patient_name, phone, appointment_time, parsedDoctorId, reason || 'General Consultation']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    // This will appear in red in your Render logs
    console.error("CRITICAL DB ERROR:", err.message); 
    
    res.status(500).json({ 
      error: "Booking failed", 
      details: err.message // Sends the exact PG error back to the frontend console
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

/* ================= UPDATE STATUS ================= */
router.put("/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const result = await pool.query(
      "UPDATE appointments SET status=$1 WHERE id=$2 RETURNING *",
      [status, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update Error:", err.message);
    res.status(500).json({ error: "Update failed" });
  }
});

/* ================= DELETE APPOINTMENT ================= */
router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM appointments WHERE id=$1 RETURNING *", [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    res.json({ message: "Appointment deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err.message);
    res.status(500).json({ error: "Deletion failed" });
  }
});

export default router;