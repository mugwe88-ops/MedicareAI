import express from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../db.js';

const router = express.Router();

/* =========================
   1. SESSION CHECK (/me)
   Used by Dashboard to verify login
========================= */
router.get('/me', async (req, res) => {
    if (!req.session?.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const { rows } = await pool.query(
            'SELECT name, role FROM users WHERE id = $1',
            [req.session.userId]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(rows[0]);
    } catch (err) {
        console.error("Session Check Error:", err);
        res.status(500).json({ error: 'Database error' });
    }
});

/* =========================
   2. SIGNUP (AUTO-VERIFIED)
========================= */
router.post('/signup', async (req, res) => {
    const { name, email, password, role, phone, kmpdc_number } = req.body;

    try {
        if (!name || !email || !password || !phone) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Doctor vetting
        if (role === 'doctor') {
            if (!kmpdc_number) {
                return res.status(400).json({ error: 'KMPDC number required' });
            }

            const kmpdcCheck = await pool.query(
                'SELECT 1 FROM verified_kmpdc WHERE registration_number = $1',
                [kmpdc_number]
            );

            if (kmpdcCheck.rowCount === 0) {
                return res.status(403).json({ error: 'Invalid KMPDC Number' });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const query = `
            INSERT INTO users (name, email, password, role, phone, kmpdc_number, is_verified)
            VALUES ($1, $2, $3, $4, $5, $6, TRUE)
            ON CONFLICT (email) DO UPDATE SET
                name = EXCLUDED.name,
                phone = EXCLUDED.phone,
                role = EXCLUDED.role,
                kmpdc_number = EXCLUDED.kmpdc_number,
                is_verified = TRUE
            RETURNING id, role, name
        `;

        const values = [
            name,
            email,
            hashedPassword,
            role || 'patient',
            phone,
            role === 'doctor' ? kmpdc_number : null
        ];

        const { rows } = await pool.query(query, values);

        // Auto-login after signup
        req.session.userId = rows[0].id;
        req.session.role = rows[0].role;

        req.session.save((err) => {
            if (err) return res.status(500).json({ error: 'Session save failed' });
            res.status(201).json({
                success: true,
                message: 'Account created successfully',
                role: rows[0].role
            });
        });

    } catch (err) {
        console.error('Signup Error:', err);
        res.status(500).json({ error: 'Server error during signup' });
    }
});

/* =========================
   3. LOGIN
========================= */
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (user && await bcrypt.compare(password, user.password)) {
            // Assign session data
            req.session.userId = user.id;
            req.session.role = user.role;

            // EXPLICITLY save the session before responding
            req.session.save((err) => {
                if (err) {
                    console.error("Session Save Error:", err);
                    return res.status(500).json({ error: "Could not create session" });
                }
                res.status(200).json({ 
                    success: true, 
                    role: user.role, 
                    name: user.name 
                });
            });
        } else {
            res.status(401).json({ error: "Invalid email or password" });
        }
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

/* =========================
   4. LOGOUT
========================= */
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ error: 'Could not log out' });
        res.clearCookie('medicareai.sid');
        res.json({ message: 'Logged out' });
    });
});

export default router;