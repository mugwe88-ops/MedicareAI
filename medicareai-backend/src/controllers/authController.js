import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import dbPool from '../utils/db.js'; 
import { sendVerificationEmail } from '../utils/email.js';

// Support both named and default exports from db.js
const pool = dbPool.pool || dbPool;

export const signup = async (req, res) => {
  const { email, password, role, name, specialization, license_number, city } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ 
      success: false, 
      message: "Email, password, and name are required." 
    });
  }

  // Acquire dedicated client from connection pool for atomic transaction handling
  const client = await pool.connect();

  try {
    // 1. Begin atomic SQL transaction
    await client.query('BEGIN');

    // 2. Check for existing user record
    const userExists = await client.query(
      "SELECT id FROM users WHERE email = $1", 
      [email]
    );

    if (userExists.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        message: "User with this email already exists." 
      });
    }

    // 3. Hash password and generate email verification token
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const userRole = (role || 'patient').toLowerCase();

    // 4. Insert primary record into users table
    const userResult = await client.query(
      `INSERT INTO users (
        email, password, role, name, specialization, license_number, city, verification_token, is_verified
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

    // 5. Insert correlated record into role-specific tables (doctors or patients)
    if (userRole === 'doctor') {
      await client.query(
        `INSERT INTO doctors (user_id, name, specialization, license_number, city, is_active) 
         VALUES ($1, $2, $3, $4, $5, true)`,
        [userId, name, specialization || null, license_number || null, city || null]
      );
    } else {
      await client.query(
        `INSERT INTO patients (user_id, name) VALUES ($1, $2)`,
        [userId, name]
      );
    }

    // 6. Commit transaction across all tables atomically
    await client.query('COMMIT');

    // Respond immediately to client
    res.status(201).json({
      success: true,
      message: "Signup successful! Check your email to verify your account.",
    });

    // 7. Send verification email out-of-band asynchronously
    setImmediate(async () => {
      try {
        await sendVerificationEmail(email, verificationToken);
      } catch (emailErr) {
        console.error("⚠️ Background verification email failed:", emailErr.message);
      }
    });

  } catch (err) {
    // Rollback transaction on any query failure
    try {
      await client.query('ROLLBACK');
    } catch (rollbackErr) {
      console.error("❌ Rollback error:", rollbackErr);
    }

    console.error("❌ Fatal Signup Error:", err);
    return res.status(500).json({ 
      success: false, 
      message: err.message || "Registration failed on server." 
    });
  } finally {
    // Guarantee client is returned to connection pool under all conditions
    client.release();
  }
};