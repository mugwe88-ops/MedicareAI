import express from 'express';
import pool from '../utils/db.js';
import { verifyToken } from '../utils/jwt.js';

const router = express.Router();

// 1. Validate that the patient has a legitimate appointment before letting them join
router.get('/verify-session/:appointmentId', verifyToken, async (req, res) => {
  const { appointmentId } = req.params;
  const patientId = req.user.id; // Securely pulled from verified JWT token

  try {
    const result = await pool.query(
      `SELECT a.id, a.status, u.name as doctor_name 
       FROM appointments a
       JOIN users u ON a.doctor_id = u.id
       WHERE a.id = $1 AND a.patient_id = $2`,
      [appointmentId, patientId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ isValid: false, error: "Unauthorized or invalid appointment reference." });
    }

    return res.json({ 
      isValid: true, 
      doctorName: result.rows[0].doctor_name,
      status: result.rows[0].status 
    });

  } catch (err) {
    console.error("Session verification database error:", err);
    return res.status(500).json({ isValid: false, error: "Internal server error verification." });
  }
});

// 2. Fallback legacy endpoint if your code hits it elsewhere
router.post('/create-room', async (req, res) => {
  return res.json({ message: "Bypassed to direct client Jitsi session generation" });
});

// CRITICAL FIX: Located cleanly at the bottom root scope so Node finds the default module export
export default router;