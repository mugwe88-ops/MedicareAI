// src/routes/auth.js

import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../utils/db.js";

const router = express.Router();

/* ======================
   PATIENT REGISTER
====================== */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, 'patient')
       RETURNING id, name, email, role`,
      [name, email, hashed]
    );

    res.json(result.rows[0]);
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

    // Verify KMPDC
    const verify = await pool.query(
      "SELECT * FROM verified_kmpdc WHERE registration_number=$1",
      [kmpdc_number]
    );

    if (!verify.rows.length) {
      return res.status(403).json({ error: "KMPDC number not verified" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, specialty, phone, kmpdc_number)
       VALUES ($1,$2,$3,'doctor',$4,$5,$6)
       RETURNING id, name, email, role, specialty`,
      [name, email, hashed, specialty, phone, kmpdc_number]
    );

    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "Email already exists" });
    }
    console.error("Doctor register error:", err);
    res.status(500).json({ error: "Doctor registration failed" });
  }
});

/* ======================
   LOGIN (PATIENT + DOCTOR)
====================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (!result.rows.length) {
      return res.status(400).json({ error: "User not found" });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ error: "Wrong password" });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET missing in env");
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        specialty: user.specialty
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

export default router;
