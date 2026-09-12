// backend/routes/patientDashboardRoutes.js
import express from 'express';
import pool from '../utils/db.js'; // Adjust path to your Neon DB pool connection

const router = express.Router();

// 1. Get Patient Medications
router.get('/medications', async (req, res) => {
  try {
    // Assuming you verify authentication and have req.user.id
    const patientId = req.user?.id || req.query.patientId;
    
    const result = await pool.query(
      'SELECT id, name, frequency as "dueTime", status FROM medications WHERE patient_id = $1 ORDER BY created_at DESC',
      [patientId]
    );
    
    res.json({ medications: result.rows });
  } catch (err) {
    console.error('Error fetching medications:', err);
    res.status(500).json({ error: 'Server error fetching medications' });
  }
});

// 2. Get Patient Lab Records / Reports
router.get('/records', async (req, res) => {
  try {
    const patientId = req.user?.id || req.query.patientId;
    
    const result = await pool.query(
      'SELECT id, title, status, created_at FROM medical_records WHERE patient_id = $1 ORDER BY created_at DESC',
      [patientId]
    );
    
    res.json({ records: result.rows });
  } catch (err) {
    console.error('Error fetching medical records:', err);
    res.status(500).json({ error: 'Server error fetching records' });
  }
});

// 3. Get Patient Doctor Messages / Chats
router.get('/messages', async (req, res) => {
  try {
    const patientId = req.user?.id || req.query.patientId;
    
    const result = await pool.query(
      'SELECT id, doctor_name as "doctorName", content, unread, created_at FROM messages WHERE patient_id = $1 ORDER BY created_at ASC',
      [patientId]
    );
    
    res.json({ messages: result.rows });
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Server error fetching messages' });
  }
});

export default router;