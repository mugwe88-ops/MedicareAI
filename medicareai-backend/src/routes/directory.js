import express from 'express';
import { pool } from '../db.js';

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

// GET /api/analytics/weekly-leads
router.get('/weekly-leads', async (req, res) => {
    const doctorId = req.session.userId; // Ensure the user is a logged-in doctor

    const query = `
        SELECT 
            TO_CHAR(clicked_at, 'Day') AS day_of_week,
            COUNT(*) AS lead_count
        FROM leads
        WHERE doctor_id = $1 
          AND clicked_at >= DATE_TRUNC('week', CURRENT_DATE)
        GROUP BY day_of_week, DATE_TRUNC('day', clicked_at)
        ORDER BY DATE_TRUNC('day', clicked_at);
    `;

    try {
        const result = await pool.query(query, [doctorId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch analytics" });
    }
});

export default router;