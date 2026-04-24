import express from "express";
import bcrypt from "bcryptjs";
import pool from "../utils/db.js";
import jwt from "jsonwebtoken"; // Import JWT to make login work with your middleware

const router = express.Router();

/* ======================
   PATIENT REGISTER / SIGNUP
====================== */
// Added /signup to match your frontend request in the screenshot
router.post(["/register", "/signup"], async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, 'patient')
       RETURNING id, name, email, role`,
      [name, email, hashed]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "Email already exists" });
    }
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

/* ======================
   DOCTOR REGISTER (WITH KMPDC CHECK)
====================== */
router.post("/doctor/register", async (req, res) => {
  try {
    const { name, email, password, specialty, phone, kmpdc_number } = req.body;

    // 1. Verify KMPDC Number
    const verify = await pool.query(
      "SELECT * FROM verified_kmpdc WHERE registration_number=$1",
      [kmpdc_number]
    );

    if (!verify.rows.length) {
      return res.status(403).json({ error: "KMPDC number not verified in our records" });
    }

    const hashed = await bcrypt.hash(password, 10);

    // NOTE: Ensure your 'users' table in server.js has these extra columns!
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, 'doctor')
       RETURNING id, name, email, role`,
      [name, email, hashed]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "Email already exists" });
    }
    console.error("Doctor register error:", err);
    res.status(500).json({ error: "Doctor registration failed" });
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

    // Generate a real token so your 'verifyToken' middleware doesn't block the user
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful",
      token, // Send this back to frontend
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