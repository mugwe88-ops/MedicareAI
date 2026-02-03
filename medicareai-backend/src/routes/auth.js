import express from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../db.js';
import { sendReply } from '../../server.js'; // Ensure you export sendReply from server.js

const router = express.Router();
const newUser = await pool.query(

// New /api/me route for your dashboard script
router.get('/me', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: "Unauthorized" });
    try {
        const user = await pool.query('SELECT name, role FROM users WHERE id = $1', [req.session.userId]);
        res.json(user.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

// Get current user profile data
router.get('/profile', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: "Unauthorized" });
    try {
        const result = await pool.query('SELECT name, email, phone, role FROM users WHERE id = $1', [req.session.userId]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

router.get('/doctor-stats', async (req, res) => {
    if (req.session.role !== 'doctor') return res.status(403).send("Unauthorized");
    
    try {
        const result = await pool.query(
            'SELECT COUNT(*) as total_clicks FROM analytics WHERE doctor_id = $1', 
            [req.session.userId]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Stats error" });
    }
});

// Update profile data
router.post('/profile/update', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: "Unauthorized" });
    const { name, phone } = req.body;
    try {
        await pool.query('UPDATE users SET name = $1, phone = $2 WHERE id = $3', [name, phone, req.session.userId]);
        res.json({ success: true, message: "Profile updated successfully" });
    } catch (err) {
        res.status(500).json({ error: "Update failed" });
    }
});

router.post('/signup', async (req, res) => {
    const { name, email, password, role, phone } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000);
    // Set expiry to 10 minutes from now
    const expiry = new Date(Date.now() + 10 * 60000); 

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO users (name, email, password, role, phone, email_otp, otp_expiry) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [name, email, hashedPassword, role || 'patient', phone, otp, expiry]
        );

        const message = `*Swift MD Verification* 🏥\n\nHello! Your verification code is: *${otp}*\n\nThis code expires in 10 minutes.`;
        
        await sendReply(process.env.WHATSAPP_PHONE_ID, phone, process.env.WHATSAPP_ACCESS_TOKEN, message);
        res.redirect('/verify-otp.html');
    } catch (err) {
        res.status(500).send("Signup failed. Please try again.");
    }
});



// Secure Logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: "Could not log out" });
        }
        res.clearCookie('connect.sid'); // Clears the session cookie in the browser
        res.json({ success: true, message: "Logged out successfully" });
    });
});

router.post('/verify-otp', async (req, res) => {
    const { otp } = req.body;
    try {
        const result = await pool.query(
            'SELECT id, otp_expiry FROM users WHERE email_otp = $1 AND is_verified = FALSE', 
            [otp]
        );

        if (result.rows.length > 0) {
            const { id, otp_expiry } = result.rows[0];

            // Check if code is expired
            if (new Date() > new Date(otp_expiry)) {
                return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
            }

            await pool.query('UPDATE users SET is_verified = TRUE, email_otp = NULL, otp_expiry = NULL WHERE id = $1', [id]);
            res.json({ success: true });
        } else {
            res.status(400).json({ success: false, message: "Invalid code." });
        }
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

router.post('/resend-otp', async (req, res) => {
    // Assuming you store userId in session during the initial signup
    const userId = req.session.userId; 

    if (!userId) {
        return res.status(400).json({ message: "Session expired. Please sign up again." });
    }

    try {
        const otp = Math.floor(100000 + Math.random() * 900000);
        const expiry = new Date(Date.now() + 10 * 60000);

        const result = await pool.query(
            'UPDATE users SET email_otp = $1, otp_expiry = $2 WHERE id = $3 RETURNING phone, name',
            [otp, expiry, userId]
        );

        if (result.rows.length > 0) {
            const { phone, name } = result.rows[0];
            const message = `*Swift MD* 🏥\n\nYour new verification code is: *${otp}*\n\nThis expires in 10 minutes.`;
            
            await sendReply(process.env.WHATSAPP_PHONE_ID, phone, process.env.WHATSAPP_ACCESS_TOKEN, message);
            res.json({ message: "New code sent to your WhatsApp!" });
        }
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// At the bottom of src/server.js
export async function sendReply(phoneId, to, token, message) {
    // ... your WhatsApp API logic ...
}