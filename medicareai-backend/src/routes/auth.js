import express from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../db.js';

const router = express.Router();

/* =========================
   1. SESSION CHECK
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
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

/* =========================
   2. SIGNUP (AUTO-VERIFIED)
========================= */
router.post('/signup', async (req, res) => {
    const { name, email, password, role, phone, kmpdc_number } = req.body;

    try {
        /* ---- A. Basic validation ---- */
        if (!name || !email || !password || !phone) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        /* ---- B. Doctor vetting ---- */
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

        /* ---- C. Hash password ---- */
        const hashedPassword = await bcrypt.hash(password, 10);

        /* ---- D. Upsert user (SAFE) ---- */
        const query = `
            INSERT INTO users (
                name,
                email,
                password,
                role,
                phone,
                kmpdc_number,
                is_verified
            )
            VALUES ($1, $2, $3, $4, $5, $6, TRUE)
            ON CONFLICT (email) DO UPDATE SET
                name = EXCLUDED.name,
                phone = EXCLUDED.phone,
                role = EXCLUDED.role,
                kmpdc_number = EXCLUDED.kmpdc_number,
                is_verified = TRUE
            RETURNING id
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

        /* ---- E. Create session ---- */
        req.session.userId = rows[0].id;
        req.session.authenticated = true;

        return res.status(201).json({
            success: true,
            message: 'Account created successfully'
        });

    } catch (err) {
        console.error('Signup Error:', err);
        res.status(500).json({ error: 'Server error during signup' });
    }
});

export default router;
