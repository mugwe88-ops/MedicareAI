import express from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../db.js';
// We must import the WhatsApp logic from your main server file
import { sendReply } from '../server.js'; 

const router = express.Router();

/* 1. SESSION CHECK */
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

/* 2. SIGNUP */
router.post('/signup', async (req, res) => {
    const { name, email, password, role, phone, kmpdc_number } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiry = new Date(Date.now() + 10 * 60000); 

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert user into DB
        await pool.query(
            'INSERT INTO users (name, email, password, role, phone, email_otp, otp_expiry, kmpdc_number) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [name, email, hashedPassword, role || 'patient', phone, otp, expiry, kmpdc_number || null]
        );

        // Attempt to send WhatsApp OTP
        const message = `*Swift MD Verification* 🏥\n\nYour code is: *${otp}*`;
        try {
            await sendReply(process.env.WHATSAPP_PHONE_ID, phone, process.env.WHATSAPP_ACCESS_TOKEN, message);
        } catch (wsError) {
            console.error("WhatsApp Send Failed, but user was created:", wsError.message);
        }
        
        res.status(200).json({ success: true, message: "Signup successful. OTP sent via WhatsApp." });
    } catch (err) {
        console.error("Signup Error Details:", err);
        // If the error is specifically about the column missing
        if (err.message.includes('kmpdc_number')) {
            return res.status(500).json({ error: "Database error: kmpdc_number column is missing. Run the reset tool!" });
        }
        res.status(500).json({ error: "Signup failed. Please try again." });
    }
});

/* 3. LOGIN */
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (user && await bcrypt.compare(password, user.password)) {
            req.session.userId = user.id;
            req.session.role = user.role;

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

/* 4. LOGOUT */
router.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('medicareai.sid');
        res.json({ success: true });
    });
});

export default router;