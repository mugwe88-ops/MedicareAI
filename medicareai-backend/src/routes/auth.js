import express from "express";
import bcrypt from "bcrypt";
import pool from "../utils/db.js";

const router = express.Router();

/* ======================
   PATIENT/DOCTOR REGISTER
====================== */
router.post("/signup", async (req, res) => {
  try {
    // 1. Extract ALL fields to match the frontend payload and server.js schema
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

    // 2. Basic Validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const hashed = await bcrypt.hash(password, 10);

    // 3. Insert into ALL columns defined in your server.js migrations
    const result = await pool.query(
      `INSERT INTO users (
        name, 
        email, 
        password, 
        role, 
        specialization, 
        license_number, 
        city, 
        phone
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, name, email, role`,
      [
        name || null, 
        email, 
        hashed, 
        role || 'patient', // Matches default in server.js
        specialization || null, 
        license_number || null, 
        city || null,
        phone || null
      ]
    );

    // 4. Success Response
    res.status(201).json(result.rows[0]); 
  } catch (err) {
    // Handle Duplicate Email
    if (err.code === "23505") {
      return res.status(400).json({ error: "Email already exists" });
    }
    
    // Log the exact error to Render console for debugging
    console.error("Signup error details:", err.message); 
    res.status(500).json({ error: "Registration failed" });
  }
});

export default router;