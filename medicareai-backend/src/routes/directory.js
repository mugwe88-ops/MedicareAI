import express from 'express';
import { pool } from '../../db.js';

const router = express.Router();

router.get('/consultants', async (req, res) => {
    try {
        // We now select the phone number along with name and specialty
        const result = await pool.query(
            'SELECT name, specialty, phone FROM users WHERE role = $1', 
            ['doctor']
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Could not fetch consultants" });
    }
});

router.get('/track-click/:doctorId', async (req, res) => {
    const { doctorId } = req.params;
    const { phone, name } = req.query;

    try {
        // Log the click in the database
        await pool.query('INSERT INTO analytics (doctor_id, event_type) VALUES ($1, $2)', [doctorId, 'whatsapp_click']);
        
        // Construct the WhatsApp URL
        const cleanPhone = phone.replace(/\D/g, '');
        const waLink = `https://wa.me/${cleanPhone}?text=Hello%20Dr.%20${encodeURIComponent(name)},%20I%20found%20you%20on%20Swift%20MD.`;
        
        // Send the user to WhatsApp
        res.redirect(waLink);
    } catch (err) {
        res.status(500).send("Tracking error");
    }
});

export default router;