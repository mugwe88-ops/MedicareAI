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

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) return res.status(400).send("User not found.");
        
        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).send("Wrong password.");

        req.session.userId = user.id; // Store in session
        res.json({ success: true, role: user.role });
    } catch (err) {
        res.status(500).send("Login error.");
    }
});

export default router;