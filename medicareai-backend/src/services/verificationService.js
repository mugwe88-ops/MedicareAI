import pool from '../db.js';

export const sendVerification = async (doctorId, email, phone) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6 digits
    
    // Save OTP to DB
    await pool.query(
        'UPDATE doctors SET email_otp = $1, phone_otp = $1 WHERE id = $2',
        [otp, doctorId]
    );

    // TODO: Integrate with SendGrid (Email) and your WhatsApp service
    console.log(`📩 Verification OTP for Dr. ID ${doctorId}: ${otp}`);
    
    return otp;
};
