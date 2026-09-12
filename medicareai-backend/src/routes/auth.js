import express from "express";
import bcrypt from "bcrypt";
import pool from "../utils/db.js";
import { signAccessToken, verifyToken as authenticateToken } from "../utils/jwt.js";

const router = express.Router();

// --- GET CURRENT USER ROUTE (/me) ---
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role, specialization, city, phone FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error("Auth check error:", err);
    res.status(500).json({ error: "Server error during auth check." });
  }
});

// --- REGISTER ROUTE ---
router.post("/register", async (req, res) => {
  const { name, email, password, role, specialization, city, phone } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: "Name, email, and password are required." });
  }

  try {
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Email is already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role || 'patient';
    const isApproved = userRole.toLowerCase() === 'doctor' ? false : true;

    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, specialization, city, phone, is_verified, is_approved)
        VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE, $8)
        RETURNING id, name, email, role, is_approved`,
      [name, email, hashedPassword, userRole, specialization || null, city || null, phone || null, isApproved]
    );

    const newUser = result.rows[0];
    const message = newUser.role.toLowerCase() === 'doctor'
      ? "Registration successful! Your doctor account is pending administrator approval."
      : "Registration successful! Account is auto-verified for testing.";

    return res.status(201).json({ message, userId: newUser.id });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ error: "Server error during registration." });
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

    if (!user.is_verified) {
      return res.status(403).json({ error: "Email not verified." });
    }

    if (user.role && user.role.toLowerCase() === 'doctor' && user.is_approved === false) {
      return res.status(403).json({ error: "Your doctor account is pending administrator approval." });
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