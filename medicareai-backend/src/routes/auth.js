import express from "express";
import bcrypt from "bcrypt";
import pool from "../utils/db.js";

const router = express.Router();

/* ======================
   PATIENT/DOCTOR REGISTER
====================== */
router.post("/signup", async (req, res) => {
  try {
    // 1. Extract ALL fields sent by the frontend
    const { 
      name, 
      email, 
      password, 
      role, 
      specialization, 
      license_number, 
      city,
      phone 
    } = req.body; 

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const hashed = await bcrypt.hash(password, 10);

    // 2. Insert into ALL 8 columns defined in server.js
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
        phone || null
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "Email already exists" });
    }
    // Log the error message to Render logs so you can see if a column is missing
    console.error("Signup error:", err.message); 
    res.status(500).json({ error: "Registration failed" });
  }
});

export default router;