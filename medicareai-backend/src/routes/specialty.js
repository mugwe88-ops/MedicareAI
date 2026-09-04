import express from 'express';
import pool from '../utils/db.js';

const router = express.Router();

// Get all medical specialties
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT specialty FROM doctors ORDER BY specialty ASC'
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching specialties:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get doctors by specific specialty
router.get('/:specialtyName/doctors', async (req, res) => {
  try {
    const { specialtyName } = req.params;
    const result = await pool.query(
      'SELECT * FROM doctors WHERE LOWER(specialty) = LOWER($1)',
      [specialtyName]
    );
    res.json({ success: true, count: result.rowCount, data: result.rows });
  } catch (error) {
    console.error('Error fetching doctors by specialty:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;