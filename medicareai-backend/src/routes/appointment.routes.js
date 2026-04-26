import express from "express";
import pool from "../utils/db.js";

const router = express.Router();

/* ================= CREATE APPOINTMENT ================= */
router.post("/", async (req, res) => {
  try {
    const { patient_name, phone, appointment_time, doctor_id, reason } = req.body;

    // Basic validation
    if (!patient_name || !phone || !appointment_time) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await pool.query(
      "INSERT INTO appointments (patient_name, phone, appointment_time, doctor_id, reason, status) VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING *",
      [patient_name, phone, appointment_time, doctor_id || null, reason || 'General Consultation']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).json({ error: "Booking failed due to server error" });
  }
});

/* ================= GET ALL APPOINTMENTS ================= */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM appointments ORDER BY appointment_time DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch appointments" });
  }
});

/* ================= GET SINGLE APPOINTMENT ================= */
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM appointments WHERE id=$1", [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Error fetching appointment" });
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
    res.status(500).json({ error: "Deletion failed" });
  }
});

export default router;