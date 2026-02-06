import express from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../db.js'; 
import { sendReply } from '../server.js'; 

const router = express.Router();

// --- 1. SESSION CHECK ---
router.get('/me', async (req, res) => {
    if (!req.session || !req.session.userId) return res.status(401).json({ error: "Unauthorized" });
    try {
        const user = await pool.query('SELECT name, role FROM users WHERE id = $1', [req.session.userId]);
        res.json(user.rows[0]);
    } catch (err) { res.status(500).json({ error: "Database error" }); }
});

// --- 2. THE MAIN SIGNUP ROUTE ---
// This handles the form submission, creates the user, and sends the OTP
router.post('/signup', async (req, res) => {
    const { name, email, password, role, phone, kmpdc_number } = req.body;

    try {
        // A. Doctor Vetting
        if (role === 'doctor') {
            const kmpdcCheck = await pool.query('SELECT * FROM verified_kmpdc WHERE registration_number = $1', [kmpdc_number]);
            if (kmpdcCheck.rows.length === 0) return res.status(403).json({ error: "Invalid KMPDC Number." });
        }

        // B. Security Setup
        const hashedPassword = await bcrypt.hash(password || 'temporary_pass_123', 10); // Default if form is split
        const otp = Math.floor(100000 + Math.random() * 900000);
        const expiry = new Date(Date.now() + 10 * 60000); 

        // C. Database Upsert (Handles 'Already Registered' by updating the OTP instead of failing)
        const query = `
            INSERT INTO users (name, email, password, role, phone, email_otp, otp_expiry, kmpdc_number, is_verified) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, FALSE)
            ON CONFLICT (email) DO UPDATE SET 
                email_otp = EXCLUDED.email_otp, 
                otp_expiry = EXCLUDED.otp_expiry,
                phone = EXCLUDED.phone
            RETURNING id
        `;
        
        const values = [name, email, hashedPassword, role || 'patient', phone, otp, expiry, kmpdc_number || null];
        const result = await pool.query(query, values);
        
        req.session.userId = result.rows[0].id;

        // D. Send WhatsApp
        const message = `*Swift MD Verification* 🏥\n\nYour code is: *${otp}*`;
        await sendReply(process.env.WHATSAPP_PHONE_ID, phone, process.env.WHATSAPP_ACCESS_TOKEN, message);
        
        res.status(200).json({ success: true, message: "OTP sent to WhatsApp" });
        // Clean the phone number (removes + and spaces)
const cleanPhone = phone.replace(/\D/g, ''); 

// Then update your message call to use cleanPhone:
await sendReply(process.env.WHATSAPP_PHONE_ID, cleanPhone, process.env.WHATSAPP_ACCESS_TOKEN, message);

    } catch (err) {
        console.error("Signup Error:", err);
        res.status(500).json({ error: `Server Error: ${err.message}` });
    }
});

// --- 3. ALIAS FOR FRONTEND ---
// If your frontend calls /send-otp, we just point it to the signup logic
router.post('/send-otp', (req, res) => router.handle(req, res)); 

// --- 4. VERIFY OTP ---
router.post('/verify-otp', async (req, res) => {
    const { otp } = req.body;
    const userId = req.session.userId;

    if (!userId) return res.status(400).json({ success: false, message: "Session expired." });

    try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        const user = result.rows[0];

        if (String(user.email_otp) === String(otp) && new Date() < new Date(user.otp_expiry)) {
            await pool.query('UPDATE users SET is_verified = TRUE, email_otp = NULL, otp_expiry = NULL WHERE id = $1', [userId]);
            req.session.authenticated = true;
            res.json({ success: true });
        } else {
            res.status(400).json({ success: false, message: "Invalid or expired code." });
        }
    } catch (err) {
    console.error("DEBUG SIGNUP ERROR:", err); 
    // This sends the actual technical error to your browser alert
    res.status(500).json({ 
        error: `Details: ${err.message} | Code: ${err.code}` 
    });
}
});

export default router;