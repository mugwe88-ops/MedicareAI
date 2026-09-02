import express from "express";
import bcrypt from "bcrypt";
import pool from "../utils/db.js";

const router = express.Router();

// --- REGISTER DOCTOR ROUTE ---
router.post("/register-doctor", async (req, res) => {
  const { email, password, displayName, specialization, licenseNumber, city } = req.body;

  if (!email || !password || !displayName) {
    return res.status(400).json({ error: "Name, email, and password are required." });
  }

  try {
    // Check if user already exists
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Email is already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert doctor into the database with is_approved = false (pending admin approval)
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, specialization, city, phone, is_verified, is_approved)
       VALUES ($1, $2, $3, 'Doctor', $4, $5, $6, TRUE, FALSE)
       RETURNING id, name, email, role, is_approved`,
      [
        displayName, 
        email, 
        hashedPassword, 
        specialization || null, 
        city || null, 
        req.body.phone || null
      ]
    );

    const newDoctor = result.rows[0];

    return res.status(201).json({
      success: true,
      message: "Doctor account registered successfully! Your account is pending administrator approval.",
      userId: newDoctor.id
    });

  } catch (err) {
    console.error("Doctor registration error:", err);
    return res.status(500).json({ error: "Server error during doctor registration." });
  }
});

export default router;