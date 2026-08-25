// src/controllers/authController.js
import pool from '../utils/db.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendVerificationEmail } from '../utils/sendEmail.js';

export const signup = async (req, res) => {
  const { email, password, name, role = 'patient', specialization, license_number, city } = req.body;

  try {
    console.log('📌 Signup request received for:', email);

    // 1. Check existing user
    const userExists = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ success: false, message: "User with this email already exists" });
    }

    // 2. Hash Password & Token
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const userRole = (role || 'patient').toLowerCase();

    // 3. Insert into Users
    const userResult = await pool.query(
      `INSERT INTO users (
        email, password, role, name, specialty, registration_number, city, verification_token, is_verified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [
        email, 
        hashedPassword, 
        userRole, 
        name, 
        specialization || null, 
        license_number || null, 
        city || null, 
        verificationToken, 
        false
      ]
    );

    const userId = userResult.rows[0].id;
    console.log('✅ User inserted into DB with ID:', userId);

    // 4. Insert into Doctors/Patients table safely inside try/catch
    try {
      if (userRole === 'doctor') {
        await pool.query(
          `INSERT INTO doctors (user_id, name, specialization, license_number, city, is_active) 
           VALUES ($1, $2, $3, $4, $5, true)`,
          [userId, name, specialization || null, license_number || null, city || null]
        );
      } else {
        await pool.query(
          "INSERT INTO patients (user_id, name) VALUES ($1, $2)",
          [userId, name]
        );
      }
    } catch (roleTableErr) {
      console.error('⚠️ Role table insertion warning:', roleTableErr.message);
      // Continue without hanging
    }

    // 5. Send Response FIRST to unblock UI immediately
    res.status(201).json({
      success: true,
      message: "Signup successful! Check your email to verify your account.",
    });

    // 6. Trigger Email after sending HTTP response
    setImmediate(async () => {
      try {
        await sendVerificationEmail(email, verificationToken);
      } catch (e) {
        console.error("⚠️ Background email dispatch failed:", e.message);
      }
    });

  } catch (err) {
    console.error("❌ Fatal Signup Error:", err);
    return res.status(500).json({ 
      success: false, 
      message: err.message || "Registration failed on server" 
    });
  }
};