import express from "express";
import bcrypt from "bcryptjs";
import pool from "../utils/db.js";
import jwt from "jsonwebtoken";

const router = express.Router();

/* ======================
   REGISTRATION (PATIENT & DOCTOR)
====================== */
router.post(["/register", "/signup"], async (req, res) => {
  try {
    const { name, email, password, role, specialization, license_number, city } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const hashed = await bcrypt.hash(password, 10);

    // Use COALESCE or null checks to handle missing fields for 'patient' role
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, specialization, license_number, city)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, email, role`,
      [
        name || null, 
        email, 
        hashed, 
        role || 'patient', 
        specialization || null, 
        license_number || null, 
        city || null
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Signup error details:", err); // This will show the exact missing column in Render logs
    if (err.code === "23505") {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* ======================
   LOGIN (JWT ENABLED)
====================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (!result.rows.length) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

export default router;