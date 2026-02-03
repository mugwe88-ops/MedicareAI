import express from 'express';
import { pool } from '../../db.js';

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
        // Inside update-status route
if (status === 'confirmed') {
    const appointment = await pool.query(
        `SELECT u.phone, u.name as patient_name, a.appointment_date, c.name as doc_name, c.whatsapp_phone_id, c.whatsapp_access_token 
         FROM appointments a 
         JOIN users u ON a.patient_id = u.id 
         JOIN consultants c ON a.department = c.calendar_id 
         WHERE a.id = $1`, [appointment_id]
    );

    if (appointment.rows.length > 0) {
        const { phone, patient_name, doc_name, whatsapp_phone_id, whatsapp_access_token } = appointment.rows[0];
        const decryptedToken = decrypt(whatsapp_access_token);
        
        const message = `Hello ${patient_name}! Your appointment with ${doc_name} has been CONFIRMED for ${appointment.rows[0].appointment_date}.`;
        
        // Call your WhatsApp sender
        await sendReply(whatsapp_phone_id, phone, decryptedToken, message, false);
    }
}

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