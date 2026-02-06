import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// Get all verified doctors
router.get('/doctors', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, name, specialty, phone, kmpdc_number 
            FROM users 
            WHERE role = 'doctor' AND is_verified = TRUE
            ORDER BY name ASC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching doctors:", err);
        res.status(500).json({ error: "Could not load doctor directory" });
    }
});

export default router;