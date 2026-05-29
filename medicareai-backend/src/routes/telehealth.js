// Add verifyToken middleware import at the top of routes/telehealth.js
import { verifyToken } from '../utils/jwt.js';
import pool from '../utils/db.js';

// ... your existing /create-room logic ...

// NEW: Validate that the patient has a legitimate appointment before letting them join
router.get('/verify-session/:appointmentId', verifyToken, async (req, res) => {
  const { appointmentId } = req.params;
  const patientId = req.user.id; // Extracted securely from JWT token

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

    // Return true along with doctor details to display on screen
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