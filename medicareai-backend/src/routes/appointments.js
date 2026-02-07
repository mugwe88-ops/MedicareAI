import express from 'express';
import pool from '../db.js';


const router = express.Router();

// Get all appointments for the logged-in doctor
router.get('/doctor-queue', async (req, res) => {
    if (!req.session?.userId || req.session.role !== 'doctor') {
        return res.status(403).json({ error: 'Access denied.' });
    }

    try {
        const result = await pool.query(`
            SELECT a.id, a.appointment_date, a.status, u.name as patient_name, u.phone as patient_phone
            FROM appointments a
            JOIN users u ON a.patient_id = u.id
            WHERE a.doctor_id = $1 AND a.status = 'pending'
            ORDER BY a.appointment_date ASC
        `, [req.session.userId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Could not load queue" });
    }
});

// UPDATE APPOINTMENT STATUS
router.put('/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // Expecting 'completed' or 'no-show'

    if (!req.session?.userId || req.session.role !== 'doctor') {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    try {
        const result = await pool.query(
            'UPDATE appointments SET status = $1 WHERE id = $2 AND doctor_id = $3 RETURNING id',
            [status, id, req.session.userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Appointment not found or unauthorized" });
        }

        res.json({ success: true, message: `Status updated to ${status}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update status" });
    }
});

export default router;