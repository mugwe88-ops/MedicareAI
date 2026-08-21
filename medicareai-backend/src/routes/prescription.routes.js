import express from "express";
import jwt from "jsonwebtoken";
import pool from "../utils/db.js";

const router = express.Router();

/* Middleware to verify JWT and extract user context */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. Token missing." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired authentication token." });
  }
};

/* ================= GET DOCTOR ISSUED PRESCRIPTIONS ================= */
router.get("/doctor", authenticateToken, async (req, res) => {
  try {
    if (req.user.role?.toLowerCase() !== "doctor") {
      return res.status(403).json({ error: "Access forbidden. Requires doctor privileges." });
    }

    const doctorId = parseInt(req.user.id, 10);

    const result = await pool.query(
      `SELECT 
        p.*, 
        u.name AS patient_name,
        u.email AS patient_email
       FROM prescriptions p
       LEFT JOIN users u ON p.patient_id = u.id
       WHERE p.doctor_id = $1
       ORDER BY p.created_at DESC`,
      [doctorId]
    );

    return res.json(result.rows || []);
  } catch (err) {
    console.error("Doctor Prescriptions Fetch Error:", err.message);
    return res.status(500).json({ error: "Failed to fetch doctor prescriptions." });
  }
});

/* ================= GET PATIENT PRESCRIPTIONS ================= */
router.get("/my-prescriptions", authenticateToken, async (req, res) => {
  try {
    const patientId = parseInt(req.user.id, 10);

    const result = await pool.query(
      `SELECT 
        p.*, 
        d.name AS doctor_name
       FROM prescriptions p
       LEFT JOIN users d ON p.doctor_id = d.id
       WHERE p.patient_id = $1
       ORDER BY p.created_at DESC`,
      [patientId]
    );

    return res.json(result.rows || []);
  } catch (err) {
    console.error("Patient Prescriptions Fetch Error:", err.message);
    return res.status(500).json({ error: "Failed to fetch patient prescriptions." });
  }
});

/* ================= CREATE PRESCRIPTION ================= */
router.post("/", authenticateToken, async (req, res) => {
  try {
    if (req.user.role?.toLowerCase() !== "doctor") {
      return res.status(403).json({ error: "Only doctors can issue prescriptions." });
    }

    const doctorId = parseInt(req.user.id, 10);
    const { patient_id, medication, dosage, instructions, duration } = req.body;

    if (!patient_id || !medication || !dosage || !instructions) {
      return res.status(400).json({ 
        error: "Missing required fields: patient_id, medication, dosage, and instructions." 
      });
    }

    const parsedPatientId = parseInt(patient_id, 10);

    const result = await pool.query(
      `INSERT INTO prescriptions (doctor_id, patient_id, medication, dosage, instructions, duration, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [
        doctorId,
        parsedPatientId,
        medication,
        dosage,
        instructions,
        duration || "7 days"
      ]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Prescription Creation Error:", err.message);
    return res.status(500).json({ error: "Failed to issue prescription.", details: err.message });
  }
});

export default router;