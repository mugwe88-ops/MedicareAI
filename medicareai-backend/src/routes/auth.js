import express from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../db.js';
import { sendReply } from '../server.js'; // Ensure you export this from server.js

const router = express.Router();

/* 1. SESSION CHECK (Essential for Dashboard) */
router.get('/me', async (req, res) => {
    if (!req.session?.userId) return res.status(401).json({ error: 'Unauthorized' });
    try {
        const { rows } = await pool.query(
            'SELECT name, email, role, phone, specialty, kmpdc_number FROM users WHERE id = $1',
            [req.session.userId]
        );
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

/* 2. SIGNUP (Now includes KMPDC logic) */
router.post('/signup', async (req, res) => {
    const { name, email, password, role, phone, kmpdc_number } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiry = new Date(Date.now() + 10 * 60000); 

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Citing the requirement for kmpdc_number in signup
        await pool.query(
            'INSERT INTO users (name, email, password, role, phone, email_otp, otp_expiry, kmpdc_number) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [name, email, hashedPassword, role || 'patient', phone, otp, expiry, kmpdc_number || null]
        );

        // WhatsApp OTP delivery
        const message = `*Swift MD Verification* 🏥\n\nYour code is: *${otp}*`;
        await sendReply(process.env.WHATSAPP_PHONE_ID, phone, process.env.WHATSAPP_ACCESS_TOKEN, message);
        
        res.status(200).json({ success: true, message: "OTP sent" });
    } catch (err) {
        console.error("Signup Error:", err);
        // Specifically catch the missing column error shown in your screenshot
        res.status(500).json({ error: "Signup failed. Ensure kmpdc_number column exists by running the Reset Tool." });
    }
});

/* 3. LOGIN (Prevents Login Loop) */
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (user && await bcrypt.compare(password, user.password)) {
            req.session.userId = user.id;
            req.session.role = user.role;

            // Manual save is critical for Render session stability
            req.session.save((err) => {
                if (err) return res.status(500).json({ error: "Session save failed" });
                res.status(200).json({ success: true, role: user.role });
            });
        } else {
            res.status(401).json({ error: "Invalid credentials" });
        }
    } catch (err) {
        res.status(500).json({ error: "Login error" });
    }
});

export default router;