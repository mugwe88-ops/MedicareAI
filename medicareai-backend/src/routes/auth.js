import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../utils/db.js";

const router = express.Router();

// CRITICAL FIX: Ensure this maps exactly to POST /api/auth/signup
router.post("/signup", async (req, res) => {
  const { name, email, password, role, specialization, licenseNumber, city, phone } = req.body;

  try {
    // 1. Check if user already exists
    const userExist = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userExist.rows.length > 0) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    // 2. Hash the password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Insert user details into the database
    const newUser = await pool.query(
      `INSERT INTO users (name, email, password, role, specialization, license_number, city, phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, name, email, role`,
      [
        name || "Medical Professional", 
        email, 
        hashedPassword, 
        role || "patient", 
        role === "doctor" ? specialization : null, 
        role === "doctor" ? licenseNumber : null, 
        city || null, 
        phone || null
      ]
    );

    // 4. Generate access token
    const token = jwt.sign(
      { id: newUser.rows[0].id, role: newUser.rows[0].role },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "24h" }
    );

    return res.status(201).json({
      message: "Registration completed successfully!",
      token,
      user: newUser.rows[0]
    });

  } catch (err) {
    console.error("Signup implementation error:", err);
    return res.status(500).json({ error: "Internal server registry breakdown" });
  }
});

// Keep your standard login route functional below it
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, result.rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: result.rows[0].id, role: result.rows[0].role },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "24h" }
    );

    return res.json({
      token,
      user: {
        id: result.rows[0].id,
        name: result.rows[0].name,
        email: result.rows[0].email,
        role: result.rows[0].role
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server login error" });
  }
});

export default router;