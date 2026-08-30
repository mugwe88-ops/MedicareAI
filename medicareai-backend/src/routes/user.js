import express from 'express';
import pool from '../utils/db.js'; // Adjust path if your db utility is located elsewhere
// Import your auth middleware if you have one, e.g.:
// import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// GET user profile
router.get('/profile', async (req, res) => {
  try {
    // If using auth middleware, req.user.id will be available. 
    // Otherwise adjust based on how you handle user identification.
    const userId = req.user?.id; 
    
    const result = await pool.query(
      'SELECT id, name, email, age, phone, medical_history FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: 'Server error fetching profile' });
  }
});

// UPDATE user profile & medical history
router.put('/profile', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { name, age, phone, medical_history } = req.body;

    const result = await pool.query(
      `UPDATE users 
       SET name = COALESCE($1, name), 
           age = COALESCE($2, age), 
           phone = COALESCE($3, phone), 
           medical_history = COALESCE($4, medical_history) 
       WHERE id = $5 
       RETURNING id, name, email, age, phone, medical_history`,
      [name, age, phone, medical_history, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: result.rows[0],
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Server error updating profile: ' + err.message });
  }
});

export default router;
