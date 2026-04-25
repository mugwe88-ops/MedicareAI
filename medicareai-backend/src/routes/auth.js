import express from "express";
import bcrypt from "bcrypt";
import pool from "../utils/db.js";

const router = express.Router();

/* ======================
   PATIENT/DOCTOR REGISTER
====================== */
router.post("/signup", async (req, res) => {
  try {
    const { 
      name, email, password, role, 
      specialization, license_number, city, phone 
    } = req.body; 

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const hashed = await bcrypt.hash(password, 10);

    // This MUST have 8 columns and 8 values ($1-$8) to match your server.js
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, specialization, license_number, city, phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, name, email, role`,
      [
        name || null, 
        email, 
        hashed, 
        role || 'patient', 
        specialization || null, 
        license_number || null, 
        city || null,
        phone || null // Added this 8th value
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("DETAILED DATABASE ERROR:", err.message); // This will show in Render logs
    if (err.code === "23505") {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Registration failed", details: err.message });
  }
});

export default router;