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
      name, email, password, role, 
      specialization, license_number, city 
    } = req.body; 

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const hashed = await bcrypt.hash(password, 10);

    // 2. Insert into ALL columns
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, specialization, license_number, city)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, email, role`,
      [
        name, 
        email, 
        hashed, 
        role || 'patient', // Default to patient if role is missing
        specialization || null, 
        license_number || null, 
        city || null
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "Email already exists" });
    }
    console.error("Signup error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});
export default router;