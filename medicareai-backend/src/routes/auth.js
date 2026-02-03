import express from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../db.js';

const router = express.Router();

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
    const { name, email, password, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await pool.query(
            'INSERT INTO users (name, email, password, role, email_otp) VALUES ($1, $2, $3, $4, $5)',
            [name, email, hashedPassword, role || 'patient', otp]
        );
        res.redirect('/verify-otp.html');
    } catch (err) {
        res.status(500).send("Signup failed.");
    }
});

router.post('/signup', async (req, res) => {
    const { name, email, password, role, phone } = req.body; 
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO users (name, email, password, role, phone) VALUES ($1, $2, $3, $4, $5)',
            [name, email, hashedPassword, role || 'patient', phone]
        );
        res.redirect('/login.html?signup=success');
    } catch (err) {
        res.status(500).send("Signup failed. Check if email is already taken.");
    }
});



export default router;