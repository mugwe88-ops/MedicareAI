import express from "express";
import bcrypt from "bcrypt";
import pool from "../utils/db.js";
import { signAccessToken } from "../utils/jwt.js";

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
    
    // Normalize role
    const userRole = role || 'patient';
    
    // Doctors require admin approval (is_approved = false), patients are approved by default
    const isApproved = userRole.toLowerCase() === 'doctor' ? false : true;

    const verificationToken = null;
    const tokenExpiresAt = null;

    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, specialization, city, phone, is_verified, verification_token, token_expires_at, is_approved)
        VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE, $8, $9, $10)
        RETURNING id, name, email, role, is_approved`,
      [
        name, 
        email, 
        hashedPassword, 
        userRole, 
        specialization || null, 
        city || null, 
        phone || null, 
        verificationToken, 
        tokenExpiresAt,
        isApproved
      ]
    );

    const newUser = result.rows[0];

    const message = newUser.role.toLowerCase() === 'doctor'
      ? "Registration successful! Your doctor account is pending administrator approval."
      : "Registration successful! Account is auto-verified for testing.";

    return res.status(201).json({
      message,
      userId: newUser.id
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

    // BLOCK unapproved doctors from logging in
    if (user.role && user.role.toLowerCase() === 'doctor' && user.is_approved === false) {
      return res.status(403).json({ 
        error: "Your doctor account is pending administrator approval. You will be able to log in once verified." 
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