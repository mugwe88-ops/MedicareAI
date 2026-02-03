import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

router.post('/book', async (req, res) => {
    if (!req.session.userId) return res.status(401).send("Unauthorized");

    const { department, appointment_date, appointment_time, reason } = req.body;
    
    try {
        await pool.query(
            'INSERT INTO appointments (patient_id, department, appointment_date, appointment_time, reason) VALUES ($1, $2, $3, $4, $5)',
            [req.session.userId, department, appointment_date, appointment_time, reason]
        );
        res.status(201).json({ message: "Booking saved" });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

export default router;