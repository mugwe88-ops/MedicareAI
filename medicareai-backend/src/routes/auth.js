import express from "express";
import bcrypt from "bcrypt";
import pool from "../utils/db.js";
import jwt from "jsonwebtoken"; // Make sure to npm install jsonwebtoken

const router = express.Router();

// SIGNUP ROUTE (Keep your existing correct signup code here)
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role, specialization, license_number, city, phone } = req.body; 
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, specialization, license_number, city, phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, name, email, role`,
      [name || null, email, hashed, role || 'patient', specialization || null, license_number || null, city || null, phone || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") return res.status(400).json({ error: "Email already exists" });
    res.status(500).json({ error: "Registration failed" });
  }
});

/* ======================
   LOGIN ROUTE (The Fix)
====================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Search for the user by email
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate JWT Token (Replace 'YOUR_SECRET_KEY' with an actual env variable)
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
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