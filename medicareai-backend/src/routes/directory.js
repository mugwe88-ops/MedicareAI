import express from 'express';
import pool from '../utils/db.js';


const router = express.Router();

// Get all verified doctors
router.get('/doctors', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, COALESCE(specialization, 'General Medicine') AS specialization, phone 
      FROM users 
      WHERE LOWER(role) = 'doctor'
      ORDER BY name ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching directory:", err);
    res.status(500).json({ error: "Could not load doctor directory" });
  }
});

export default router;