import express from "express";
import bcrypt from "bcryptjs";
import pool from "../config/db.js"; // REMOVED curly braces
import jwt from "jsonwebtoken";
import { verifyToken } from "../utils/jwt.js";

const router = express.Router();

router.get("/me", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role FROM users WHERE id = $1",
      [req.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * ✅ SIGNUP ROUTE
 * Per your instruction: is_verified is set to TRUE immediately
 */
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role, specialization, license_number, city, phone } = req.body; 
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const hashed = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, specialization, license_number, city, phone, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, name, email, role`,
      [name || null, email, hashed, role || 'patient', specialization || null, license_number || null, city || null, phone || null, true]
    ); 

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") return res.status(400).json({ error: "Email already exists" });
    console.error("SIGNUP ERROR:", err.message);
    res.status(500).json({ error: "Registration failed" });
  }
});

/**
 * ✅ LOGIN ROUTE
 */
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
      { userId: user.id, email: user.email, role: user.role },
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