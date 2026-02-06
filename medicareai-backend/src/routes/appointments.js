import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// Get all appointments for the logged-in doctor
router.get('/doctor-queue', async (req, res) => {
    // 1. Verify the user is logged in and is a doctor
    if (!req.session?.userId || req.session.role !== 'doctor') {
        return res.status(403).json({ error: 'Access denied. Doctor only.' });
    }

    try {
        // 2. Fetch appointments from the database joined with patient names
        const result = await pool.query(`
            SELECT a.id, a.appointment_date, a.status, u.name as patient_name, u.phone as patient_phone
            FROM appointments a
            JOIN users u ON a.patient_id = u.id
            WHERE a.doctor_id = $1
            ORDER BY a.appointment_date ASC
        `, [req.session.userId]);

        res.json(result.rows);
    } catch (err) {
        console.error("Queue Fetch Error:", err);
        res.status(500).json({ error: "Could not load appointment queue" });
    }
});

// Update appointment status (e.g., mark as completed)
router.put('/:id/status', async (req, res) => {
    if (!req.session?.userId || req.session.role !== 'doctor') {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    const { status } = req.body;
    try {
        await pool.query(
            'UPDATE appointments SET status = $1 WHERE id = $2 AND doctor_id = $3',
            [status, req.params.id, req.session.userId]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to update status" });
    }
});

export default router;