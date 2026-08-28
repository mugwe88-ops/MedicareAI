import express from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import pool from "../utils/db.js";
import { signAccessToken } from "../utils/jwt.js";
import { sendVerificationEmail } from "../utils/email.js";

const router = express.Router();

// --- REGISTER ROUTE ---
router.post("/register", async (req, res) => {
  const { name, email, password, role, specialization, city, phone } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: "Name, email, and password are required." });
  }

  try {
    // Check if user already exists
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Email is already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate secure token & expiration (24 hours)
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, specialization, city, phone, is_verified, verification_token, token_expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE, $8, $9)
       RETURNING id, name, email, role`,
      [
        name, 
        email, 
        hashedPassword, 
        role || 'patient', 
        specialization || null, 
        city || null, 
        phone || null, 
        verificationToken, 
        tokenExpiresAt
      ]
    );

    const newUser = result.rows[0];

    // Trigger verification email dispatch
    await sendVerificationEmail(email, name, verificationToken);

    // Construct verification link for debug fallback
    const verificationLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-email?token=${verificationToken}`;

    return res.status(201).json({
      message: "Registration successful! (Debug fallback active)",
      userId: newUser.id,
      debugToken: verificationToken,
      verificationLink: verificationLink
    });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ error: "Server error during registration." });
  }
});

// --- VERIFY TOKEN ROUTE ---
router.get("/verify", async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: "Missing verification token." });
  }

  try {
    const userResult = await pool.query(
      `SELECT id, email, token_expires_at, is_verified FROM users WHERE verification_token = $1`,
      [token]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or already used verification token." });
    }

    const user = userResult.rows[0];

    if (user.is_verified) {
      return res.json({ message: "Email is already verified. You can log in." });
    }

    if (new Date() > new Date(user.token_expires_at)) {
      return res.status(400).json({ error: "Verification token has expired. Please register again or request a new link." });
    }

    // Activate user and wipe token fields
    await pool.query(
      `UPDATE users 
       SET is_verified = TRUE, 
           verification_token = NULL, 
           token_expires_at = NULL 
       WHERE id = $1`,
      [user.id]
    );

    return res.json({ message: "Email successfully verified! You may now log in." });
  } catch (err) {
    console.error("Verification error:", err);
    return res.status(500).json({ error: "Server error during verification." });
  }
});

// --- LOGIN ROUTE ---
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const user = result.rows[0];

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // BLOCK unverified users from logging in
    if (!user.is_verified) {
      return res.status(403).json({ 
        error: "Email not verified. Please check your inbox for the verification link." 
      });
    }

    const token = signAccessToken(user);

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error during login." });
  }
});

export default router;