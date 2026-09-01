import express from 'express';
import pool from '../utils/db.js'; 

const router = express.Router();

// ✅ Correct path: points to your existing utility file
import { verifyToken as authenticateToken } from '../utils/jwt.js'; 

// GET all conversations for the logged-in user (Doctor or Patient)
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role; // 'doctor' or 'patient'

    let query = '';
    if (userRole === 'doctor') {
      // Fetch patients who have messaged or booked this doctor
      query = `
        SELECT DISTINCT p.id as patient_id, p.name as patient_name, p.email as patient_email
        FROM users p
        JOIN appointments a ON a.patient_id = p.id
        WHERE a.doctor_id = $1
      `;
    } else {
      // Fetch doctors the patient has interacted with
      query = `
        SELECT DISTINCT d.id as doctor_id, d.name as doctor_name, d.specialization as doctor_specialization
        FROM users d
        JOIN appointments a ON a.doctor_id = d.id
        WHERE a.patient_id = $1
      `;
    }

    const { rows } = await pool.query(query, [userId]);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching conversations:", err);
    res.status(500).json({ error: "Server error fetching conversations" });
  }
});

// GET message history with a specific user ID
router.get('/:otherUserId', authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.otherUserId;

    const query = `
      SELECT * FROM messages 
      WHERE (sender_id = $1 AND receiver_id = $2) 
         OR (sender_id = $2 AND receiver_id = $1)
      ORDER BY created_at ASC
    `;
    const { rows } = await pool.query(query, [currentUserId, otherUserId]);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching message history:", err);
    res.status(500).json({ error: "Server error fetching messages" });
  }
});

// POST send a new message
router.post('/', authenticateToken, async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiver_id, message_text } = req.body;

    if (!receiver_id || !message_text) {
      return res.status(400).json({ error: "Receiver and message text are required" });
    }

    const query = `
      INSERT INTO messages (sender_id, receiver_id, message_text, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING *
    `;
    const { rows } = await pool.query(query, [senderId, receiver_id, message_text]);
    
    res.status(201).json({ message: rows[0] });
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ error: "Server error sending message" });
  }
});

export default router;