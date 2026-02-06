import express from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../db.js'; 
import { sendReply } from '../server.js'; 

const router = express.Router();

// 1. Get current session user
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

// 2. Get full profile data
router.get('/profile', async (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    try {
        const result = await pool.query(
            'SELECT name, email, phone, role, kmpdc_number FROM users WHERE id = $1', 
            [req.session.userId]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

// 3. SIGNUP - Corrected to match your frontend's call to /api/auth/signup
// NOTE: Your signup.html was originally hitting /signup, but your route is in auth.js
router.post('/signup', async (req, res) => {
    const { name, email, password, role, phone, kmpdc_number } = req.body;
    
    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiry = new Date(Date.now() + 10 * 60000); // 10 minute expiry

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const query = `
            INSERT INTO users (name, email, password, role, phone, email_otp, otp_expiry, kmpdc_number, is_verified) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, FALSE)
            RETURNING id
        `;
        
        const values = [
            name, 
            email, 
            hashedPassword, 
            role || 'patient', 
            phone, 
            otp, 
            expiry, 
            kmpdc_number || null
        ];

        const result = await pool.query(query, values);
        
        // Store user ID in session for the verification step
        req.session.userId = result.rows[0].id;

        // Send WhatsApp OTP using your server.js utility
        const message = `*Swift MD Verification* 🏥\n\nHello ${name}! Your verification code is: *${otp}*\n\nThis code expires in 10 minutes.`;
        
        await sendReply(process.env.WHATSAPP_PHONE_ID, phone, process.env.WHATSAPP_ACCESS_TOKEN, message);
        
        res.status(200).json({ success: true, message: "OTP sent to WhatsApp" });

        // Inside your registration/signup route
const { kmpdc_number, email, password, name } = req.body;

// 1. Check if the KMPDC number is in our "Verified" whitelist
const kmpdcCheck = await pool.query(
    'SELECT * FROM verified_kmpdc WHERE registration_number = $1',
    [kmpdc_number]
);

if (kmpdcCheck.rows.length === 0) {
    return res.status(403).json({ 
        error: "Invalid KMPDC Number. You must be a registered practitioner to create a profile." 
    });
}

// 2. If valid, proceed with existing signup logic...
        
    } catch (err) {
        console.error("Signup Error:", err);
        res.status(500).json({ error: "Signup failed. Check if phone/email is already registered." });
    }
});

// 4. VERIFY OTP - Finalizes registration
// Updated to ensure it looks for the user currently in the session
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

            // Verify OTP match and Expiry
            if (user.email_otp !== otp) {
                 return res.status(400).json({ success: false, message: "Invalid verification code." });
            }

            if (new Date() > new Date(user.otp_expiry)) {
                return res.status(400).json({ success: false, message: "OTP has expired." });
            }

            // Mark as verified
            await pool.query(
                'UPDATE users SET is_verified = TRUE, email_otp = NULL, otp_expiry = NULL WHERE id = $1', 
                [user.id]
            );

            // Establish full session
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

// 5. RESEND OTP - Corrected endpoint to /resend-otp as per your verify-otp.html fetch
router.post('/resend-otp', async (req, res) => {
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
            const message = `*Swift MD* 🏥\n\nYour new verification code is: *${otp}*`;
            
            await sendReply(process.env.WHATSAPP_PHONE_ID, phone, process.env.WHATSAPP_ACCESS_TOKEN, message);
            res.json({ message: "New code sent to your WhatsApp!" });
        }
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// 6. LOGOUT
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ error: "Could not log out" });
        res.clearCookie('connect.sid'); 
        res.json({ success: true, message: "Logged out successfully" });
    });
});

export default router;