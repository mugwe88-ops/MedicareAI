import express from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../db.js'; 
import { sendReply } from '../server.js'; 

const router = express.Router();

// --- 1. SESSION & PROFILE ROUTES ---
router.get('/me', async (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    try {
        const user = await pool.query('SELECT name, role FROM users WHERE id = $1', [req.session.userId]);
        res.json(user.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

// --- 2. SIGNUP/REGISTER ROUTE ---
router.post('/signup', async (req, res) => {
    const { name, email, password, role, phone, kmpdc_number } = req.body;

    try {
        // A. DOCTOR VETTING: Check KMPDC if role is doctor
        if (role === 'doctor') {
            if (!kmpdc_number) {
                return res.status(400).json({ error: "KMPDC number is required for doctor registration." });
            }
            const kmpdcCheck = await pool.query(
                'SELECT * FROM verified_kmpdc WHERE registration_number = $1',
                [kmpdc_number]
            );

            if (kmpdcCheck.rows.length === 0) {
                return res.status(403).json({ 
                    error: "Invalid KMPDC Number. You must be a registered practitioner." 
                });
            }
        }

        // B. PREPARE SECURITY: Hash password and generate OTP
        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = Math.floor(100000 + Math.random() * 900000);
        const expiry = new Date(Date.now() + 10 * 60000); 

        // C. DATABASE INSERT
        const query = `
            INSERT INTO users (name, email, password, role, phone, email_otp, otp_expiry, kmpdc_number, is_verified) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, FALSE)
            RETURNING id
        `;
        
        const values = [name, email, hashedPassword, role || 'patient', phone, otp, expiry, kmpdc_number || null];
        const result = await pool.query(query, values);
        
        // D. SESSION & NOTIFICATION
        req.session.userId = result.rows[0].id;
        const message = `*Swift MD Verification* 🏥\n\nHello ${name}! Your verification code is: *${otp}*\n\nThis code expires in 10 minutes.`;
        
        await sendReply(process.env.WHATSAPP_PHONE_ID, phone, process.env.WHATSAPP_ACCESS_TOKEN, message);
        
        res.status(200).json({ success: true, message: "OTP sent to WhatsApp" });

    } catch (err) {
        console.error("Signup Error:", err);
        // Handle duplicate email/phone errors gracefully
        if (err.code === '23505') {
            return res.status(400).json({ error: "Email or phone number already registered." });
        }
        res.status(500).json({ error: "Signup failed. Please try again later." });
    }
});

// --- 3. VERIFICATION & LOGIN ---
router.post('/verify-otp', async (req, res) => {
    const { otp } = req.body;
    const userId = req.session.userId;

    if (!userId) {
        return res.status(400).json({ success: false, message: "Session expired. Please sign up again." });
    }

    try {
        const result = await pool.query(
            'SELECT id, email_otp, otp_expiry, role FROM users WHERE id = $1 AND is_verified = FALSE', 
            [userId]
        );

        if (result.rows.length > 0) {
            const user = result.rows[0];

            if (String(user.email_otp) !== String(otp)) {
                 return res.status(400).json({ success: false, message: "Invalid verification code." });
            }

            if (new Date() > new Date(user.otp_expiry)) {
                return res.status(400).json({ success: false, message: "OTP has expired." });
            }

            await pool.query(
                'UPDATE users SET is_verified = TRUE, email_otp = NULL, otp_expiry = NULL WHERE id = $1', 
                [user.id]
            );

            req.session.authenticated = true;
            req.session.role = user.role;
            res.json({ success: true });
        } else {
            res.status(400).json({ success: false, message: "User already verified or not found." });
        }
    } catch (err) {
        console.error("Verification Error:", err);
        res.status(500).json({ error: "Server error during verification" });
    }
});

// --- 4. RESEND OTP ---
router.post('/resend-otp', async (req, res) => {
    const userId = req.session.userId; 
    if (!userId) return res.status(400).json({ message: "Session expired." });

    try {
        const otp = Math.floor(100000 + Math.random() * 900000);
        const expiry = new Date(Date.now() + 10 * 60000);
        const result = await pool.query(
            'UPDATE users SET email_otp = $1, otp_expiry = $2 WHERE id = $3 RETURNING phone, name',
            [otp, expiry, userId]
        );

        if (result.rows.length > 0) {
            const { phone, name } = result.rows[0];
            const message = `*Swift MD* 🏥\n\nYour new verification code is: *${otp}*`;
            await sendReply(process.env.WHATSAPP_PHONE_ID, phone, process.env.WHATSAPP_ACCESS_TOKEN, message);
            res.json({ message: "New code sent!" });
        }
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// --- 5. LOGOUT ---
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ error: "Could not log out" });
        res.clearCookie('connect.sid'); 
        res.json({ success: true, message: "Logged out" });
    });
});

// --- ADD THIS TO src/routes/auth.js ---

// This handles the 'Send Verification Code' button on your signup page
router.post('/send-otp', async (req, res) => {
    const { phone, email, name, role, kmpdc_number } = req.body;

    try {
        // 1. DOCTOR VETTING (If applicable)
        if (role === 'doctor') {
            const kmpdcCheck = await pool.query(
                'SELECT * FROM verified_kmpdc WHERE registration_number = $1',
                [kmpdc_number]
            );
            if (kmpdcCheck.rows.length === 0) {
                return res.status(403).json({ error: "Invalid KMPDC Number." });
            }
        }

        // 2. GENERATE OTP
        const otp = Math.floor(100000 + Math.random() * 900000);
        const expiry = new Date(Date.now() + 10 * 60000);

        // 3. STORE TEMPORARY USER OR UPDATE OTP
        // Note: You can store this in a 'temp_users' table or insert into 'users' as unverified
        const result = await pool.query(
            `INSERT INTO users (name, email, phone, role, email_otp, otp_expiry, kmpdc_number, is_verified) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE) 
             ON CONFLICT (email) DO UPDATE SET email_otp = $5, otp_expiry = $6 
             RETURNING id`,
            [name, email, phone, role, otp, expiry, kmpdc_number]
        );

        req.session.userId = result.rows[0].id;

        // 4. SEND WHATSAPP
        const message = `*Swift MD Code*: ${otp}`;
        await sendReply(process.env.WHATSAPP_PHONE_ID, phone, process.env.WHATSAPP_ACCESS_TOKEN, message);

        res.json({ success: true, message: "Code sent!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to send code. Is the email/phone already taken?" });
    }
});

export default router;