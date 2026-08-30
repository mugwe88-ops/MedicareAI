import express from 'express';
import jwt from 'jsonwebtoken';
import pool from '../utils/db.js';
import { decrypt } from '../encryption.js';

const router = express.Router();

// Inline authentication middleware to verify the Authorization header
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401.3 || 401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

router.get('/', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT * FROM medical_records 
      WHERE patient_id = $1 
      ORDER BY created_at DESC
    `;
    const { rows } = await pool.query(query, [req.user.id]);

    const processedRows = rows.map(record => {
      try {
        return {
          ...record,
          clinical_notes: record.is_encrypted ? decrypt(record.clinical_notes) : record.clinical_notes,
          test_ordered: record.is_encrypted ? decrypt(record.test_ordered) : record.test_ordered,
          test_name: record.is_encrypted ? decrypt(record.test_name) : record.test_name,
          medication_details: record.is_encrypted ? decrypt(record.medication_details) : record.medication_details,
          instructions: record.is_encrypted ? decrypt(record.instructions) : record.instructions,
          clinical_instructions: record.is_encrypted ? decrypt(record.clinical_instructions) : record.clinical_instructions,
        };
      } catch (err) {
        console.error("Failed to decrypt record ID:", record.id);
        return record;
      }
    });

    res.json(processedRows);
  } catch (err) {
    console.error("Error fetching medical records:", err);
    res.status(500).json({ error: "Failed to fetch medical records" });
  }
});

export default router;
