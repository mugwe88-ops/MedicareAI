import express from "express";
import pool from "../utils/db.js";

const router = express.Router();

/* ================= CREATE APPOINTMENT ================= */
router.post("/", async (req, res) => {
  try {
    const { patient_name, phone, appointment_time, doctor_id, reason, patient_id } = req.body;

    if (!patient_name || !phone || !appointment_time) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const parsedDoctorId = doctor_id ? parseInt(doctor_id, 10) : null;
    const parsedPatientId = patient_id ? parseInt(patient_id, 10) : null;

    console.log(`Attempting booking for: ${patient_name} at ${appointment_time}`);

    const result = await pool.query(
      `INSERT INTO appointments (patient_name, phone, appointment_time, doctor_id, patient_id, reason, status) 
       VALUES ($1, $2, $3, $4, $5, $6, 'pending') RETURNING *`,
      [patient_name, phone, appointment_time, parsedDoctorId, parsedPatientId, reason || 'General Consultation']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("CRITICAL DB ERROR:", err.message); 
    res.status(500).json({ error: "Booking failed", details: err.message });
  }
});

/* ================= GET FILTERED APPOINTMENTS (The Privacy Fix) ================= */
router.get("/", async (req, res) => {
  const { patient_id, doctor_id } = req.query;

  try {
    let query = "SELECT * FROM appointments";
    let params = [];

    // If a patient_id is provided, only show their appointments
    if (patient_id) {
      query += " WHERE patient_id = $1";
      params.push(patient_id);
    } 
    // If a doctor_id is provided, only show their appointments
    else if (doctor_id) {
      query += " WHERE doctor_id = $1";
      params.push(doctor_id);
    }

    query += " ORDER BY appointment_time DESC";
    
    const result = await pool.query(query, params);
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