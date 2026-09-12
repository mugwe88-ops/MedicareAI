import express from "express";
import jwt from "jsonwebtoken";
import pool from "../utils/db.js";

const router = express.Router();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }
  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    req.user = { ...decoded, userId: decoded.userId || decoded.id };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token." });
  }
};

/* ================= GET DOCTOR AVAILABILITY (For Patients) ================= */
router.get("/doctor/:doctorId", async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    const result = await pool.query(
      `SELECT id, doctor_id, date, status, time_slots 
       FROM doctor_availability 
       WHERE doctor_id = $1 AND date >= CURRENT_DATE 
       ORDER BY date ASC`,
      [parseInt(doctorId, 10)]
    );

    // If no custom availability is set yet, return default fallback open slots for the next 7 days
    if (result.rows.length === 0) {
      return res.json([
        { date: new Date().toISOString().split('T')[0], status: 'OPEN', time_slots: '09:00 - 05:00' }
      ]);
    }

    return res.json(result.rows);
  } catch (err) {
    console.error("Fetch Availability Error:", err.message);
    return res.status(500).json({ error: "Could not fetch doctor availability." });
  }
});

/* ================= SAVE / UPDATE AVAILABILITY (For Doctors) ================= */
router.post("/update", authenticateToken, async (req, res) => {
  try {
    if (req.user.role?.toLowerCase() !== "doctor") {
      return res.status(403).json({ error: "Access forbidden. Doctor privileges required." });
    }

    const doctorId = parseInt(req.user.userId, 10);
    const { date, status, time_slots } = req.body;

    if (!date || !status) {
      return res.status(400).json({ error: "Date and status are required." });
    }

    const result = await pool.query(
      `INSERT INTO doctor_availability (doctor_id, date, status, time_slots)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (doctor_id, date) 
       DO UPDATE SET status = EXCLUDED.status, time_slots = EXCLUDED.time_slots
       RETURNING *`,
      [doctorId, date, status, time_slots || '09:00 - 05:00']
    );

    return res.json({ success: true, availability: result.rows[0] });
  } catch (err) {
    console.error("Save Availability Error:", err.message);
    return res.status(500).json({ error: "Failed to update availability." });
  }
});

export default router;