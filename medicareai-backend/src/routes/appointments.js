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

router.post('/update-status', async (req, res) => {
    const { appointment_id, status } = req.body;
    
    try {
        // 1. Update the database
        const result = await pool.query(
            'UPDATE appointments SET status = $1 WHERE id = $2 RETURNING patient_id, department', 
            [status, appointment_id]
        );

        // 2. If confirmed, send WhatsApp notification
        if (status === 'confirmed' && result.rows.length > 0) {
            const patientId = result.rows[0].patient_id;
            
            // Get patient phone and consultant details
            const patientData = await pool.query('SELECT name FROM users WHERE id = $1', [patientId]);
            
            // Note: You'll need to store/fetch the patient's phone number here
            // console.log(`Triggering WhatsApp to Patient ${patientData.rows[0].name}: Appointment Confirmed!`);
            
            // Here you would call your sendReply function from server.js
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Update failed" });
    }
});

// Get all appointments for the logged-in user
router.get('/my-appointments', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: "Unauthorized" });

    try {
        const result = await pool.query(
            'SELECT id, department, appointment_date, appointment_time, status FROM appointments WHERE patient_id = $1 ORDER BY appointment_date DESC',
            [req.session.userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
});

export default router;