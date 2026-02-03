import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

router.get('/consultants', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT name, role FROM users WHERE role = $1', 
            ['doctor']
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Could not fetch consultants" });
    }
});

export default router;