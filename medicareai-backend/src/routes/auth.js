import express from "express";
import bcrypt from "bcryptjs"; // Updated to match your authController.js usage
import pool from "../utils/db.js";
import jwt from "jsonwebtoken";
// Importing existing controllers and middleware for the "Me" endpoint
import { getMe, signup, login, verifyEmail } from "../controllers/authController.js";
import { verifyToken } from "../utils/jwt.js";

const router = express.Router();

/**
 * ✅ PERSISTENCE ROUTE
 * This allows the frontend to verify the session on refresh.
 */
router.get("/me", verifyToken, getMe);

// SIGNUP ROUTE
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role, specialization, license_number, city, phone } = req.body; 
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, specialization, license_number, city, phone, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, name, email, role`,
      [name || null, email, hashed, role || 'patient', specialization || null, license_number || null, city || null, phone || null, true]
    ); // Note: is_verified set to true per your MedicareAI simplified auth flow.
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") return res.status(400).json({ error: "Email already exists" });
    res.status(500).json({ error: "Registration failed" });
  }
});

/* ======================
   LOGIN ROUTE
====================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role }, // Changed key to 'userId' to match verifyToken middleware
      process.env.JWT_SECRET || "medicare_secret_key",
      { expiresIn: "1d" }
    );

    res.json({
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
    console.error("LOGIN ERROR:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;