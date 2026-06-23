import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../utils/db.js";

const router = express.Router();

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  const { name, email, password, role, specialization, licenseNumber, city, phone } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password fields are strictly required." });
  }

  try {
    const userExist = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userExist.rows.length > 0) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // If name field is missing from frontend card, split email prefix as fallback
    const resolvedName = name && name.trim() !== "" ? name : email.split('@')[0];
    const resolvedRole = role || "patient";
    const resolvedSpecialization = resolvedRole === "doctor" && specialization ? specialization : null;
    const resolvedLicense = resolvedRole === "doctor" && licenseNumber && licenseNumber.trim() !== "" ? licenseNumber : null;
    const resolvedCity = city && city.trim() !== "" ? city : null;
    const resolvedPhone = phone && phone.trim() !== "" ? phone : null;

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

    const token = jwt.sign(
      { id: newUser.rows[0].id, role: newUser.rows[0].role },
      process.env.JWT_SECRET || "fallback_secret",
      { 
        expiresIn: "24h",
        audience: "medicareai-users" // Explicit audience signature fix
      }
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

    const userRow = result.rows[0];

    // Build signed token payload string securely
    const token = jwt.sign(
      { id: userRow.id, role: userRow.role || "patient" },
      process.env.JWT_SECRET || "fallback_secret",
      { 
        expiresIn: "24h",
        audience: "medicareai-users" // Explicit audience signature fix
      }
    );

    // Return full explicit values so role checks don't evaluate to undefined
    return res.json({
      token,
      user: {
        id: userRow.id,
        name: userRow.name || userRow.email.split('@')[0],
        email: userRow.email,
        role: userRow.role || "patient"
      }
    });
  } catch (err) {
    console.error("Server login error:", err);
    return res.status(500).json({ error: "Server login error" });
  }
});

// GET /api/auth/me
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret", {
      audience: "medicareai-users" // Confirms inbound authorization checks mirror setup criteria
    });

    const result = await pool.query(
      "SELECT id, name, email, role, specialization, license_number, city, phone FROM users WHERE id = $1",
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User profile not found." });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error("Profile verification session failure:", err);
    return res.status(401).json({ error: "Session expired or invalid credentials." });
  }
});

export default router;