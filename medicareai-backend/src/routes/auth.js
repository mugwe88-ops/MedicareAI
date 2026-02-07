import express from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../db.js';

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

/* 2. UPDATE PROFILE */
router.put('/update-profile', async (req, res) => {
    if (!req.session?.userId) return res.status(401).json({ error: 'Unauthorized' });
    
    const { name, phone, specialty } = req.body;
    try {
        await pool.query(
            'UPDATE users SET name = $1, phone = $2, specialty = $3 WHERE id = $4',
            [name, phone, specialty, req.session.userId]
        );
        res.json({ success: true, message: "Profile updated!" });
    } catch (err) {
        res.status(500).json({ error: "Update failed" });
    }
});

/* 3. SIGNUP */
router.post('/signup', async (req, res) => {
    const { name, email, password, role, phone, kmpdc_number } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const { rows } = await pool.query(
            `INSERT INTO users (name, email, password, role, phone, kmpdc_number, is_verified) 
             VALUES ($1, $2, $3, $4, $5, $6, TRUE) RETURNING id, role`,
            [name, email, hashedPassword, role || 'patient', phone, kmpdc_number]
        );
        req.session.userId = rows[0].id;
        req.session.role = rows[0].role;
        req.session.save(() => res.status(201).json({ success: true }));
    } catch (err) {
        res.status(500).json({ error: 'Signup failed' });
    }
});

/* 4. LOGIN */
/* 4. LOGIN */
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (user && await bcrypt.compare(password, user.password)) {
            // Setting session data
            req.session.userId = user.id;
            req.session.role = user.role;

            // FORCE a manual save to the database (connect-pg-simple) 
            // before sending the 200 OK response.
            req.session.save((err) => {
                if (err) {
                    console.error("Session Save Error:", err);
                    return res.status(500).json({ error: "Could not initialize session" });
                }
                // Only respond once the session is confirmed saved in Postgres
                res.status(200).json({ success: true, role: user.role });
            });
        } else {
            res.status(401).json({ error: "Invalid credentials" });
        }
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ error: "Login error" });
    }
});

/* 5. LOGOUT */
router.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('medicareai.sid');
        res.json({ success: true });
    });
});

export default router;