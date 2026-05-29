import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../utils/db.js";

const router = express.Router();

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  const { name, email, password, role, specialization, licenseNumber, city, phone } = req.body;

  // 1. Strict validation checks
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password fields are strictly required." });
  }

  try {
    // 2. Check if user already exists
    const userExist = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userExist.rows.length > 0) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    // 3. Hash the password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. FIX: If name input field is missing on frontend, dynamically parse email prefix as the fallback name
    const resolvedName = name && name.trim() !== "" ? name : email.split('@')[0];

    // 5. Clean up string inputs to avoid inserting empty strings into specialist columns
    const resolvedRole = role || "patient";
    const resolvedSpecialization = resolvedRole === "doctor" && specialization ? specialization : null;
    const resolvedLicense = resolvedRole === "doctor" && licenseNumber && licenseNumber.trim() !== "" ? licenseNumber : null;
    const resolvedCity = city && city.trim() !== "" ? city : null;
    const resolvedPhone = phone && phone.trim() !== "" ? phone : null;

    // 6. Insert user details into the database safely
    const newUser = await pool.query(
      `INSERT INTO users (name, email, password, role, specialization, license_number, city, phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, name, email, role`,
      [
        resolvedName, 
        email, 
        hashedPassword, 
        resolvedRole, 
        resolvedSpecialization, 
        resolvedLicense, 
        resolvedCity, 
        resolvedPhone
      ]
    );

    // 7. Generate access token
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
    console.error("Signup validation breakdown:", err);
    return res.status(400).json({ error: "Database rejected values. Verify registration schema fields." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

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
    console.error("Server login error:", err);
    return res.status(500).json({ error: "Server login error" });
  }
});

export default router