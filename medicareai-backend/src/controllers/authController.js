// src/controllers/authController.js
import pool from '../utils/db.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendVerificationEmail } from '../utils/sendEmail.js';

export const signup = async (req, res) => {
  const { email, password, name, role = 'patient', specialization, license_number, city } = req.body;

  try {
    // 1. Check if user already exists
    const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // 2. Hash Password & Generate Token
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const userRole = role.toLowerCase();

    // 3. Save directly to 'users' table
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

    // 4. Populate role-specific tables safely
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

    // 5. Fire Resend verification email (Non-blocking background attempt)
    sendVerificationEmail(email, verificationToken).catch((mailErr) => {
      console.error("⚠️ Background Email Delivery Error:", mailErr.message);
    });

    // 6. Return HTTP 201 response immediately to release frontend UI button
    return res.status(201).json({
      success: true,
      message: "Signup successful! Check your email to verify your account.",
    });

  } catch (err) {
    console.error("❌ Signup error:", err);
    return res.status(500).json({ 
      success: false, 
      message: err.message || "Registration failed on server" 
    });
  }
};