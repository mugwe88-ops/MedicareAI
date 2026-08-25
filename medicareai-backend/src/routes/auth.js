import express from "express";
import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendVerificationEmail } from "../utils/sendEmail.js"; // Import Resend helper

const router = express.Router();

// --- VERIFICATION ROUTE ---
router.get("/verify", async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ error: "Verification token is missing." });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE verification_token = $1", [token]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired verification token." });
    }

    await pool.query(
      "UPDATE users SET is_verified = true, verification_token = NULL WHERE verification_token = $1",
      [token]
    );

    return res.json({ message: "Email verified successfully! You can now log in." });
  } catch (err) {
    console.error("Verification error:", err);
    return res.status(500).json({ error: "Server error during verification." });
  }
});

// --- LOGIN ROUTE ---
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    const user = result.rows[0];

    // Check if email is verified
    if (!user.is_verified) {
      return res.status(403).json({ error: "Please verify your email before logging in." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    // Create JWT Token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error during login." });
  }
});

// --- SIGNUP ROUTE ---
router.post("/signup", async (req, res) => {
  const { name, email, password, role, specialization, city } = req.body;
  const phone = req.body.phone || req.body.phone_number;
  const licenseNumber = req.body.licenseNumber || req.body.license_number;

  if (!email || !password || !phone) {
    return res.status(400).json({ error: "Email, password, and phone number are required." });
  }

  try {
    const userExist = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userExist.rows.length > 0) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const resolvedName = name && name.trim() !== "" ? name : email.split('@')[0];
    const resolvedRole = role ? role.toLowerCase() : "patient";
    const resolvedSpecialization = resolvedRole === "doctor" && specialization ? specialization : null;
    const resolvedLicense = resolvedRole === "doctor" && licenseNumber && licenseNumber.trim() !== "" ? licenseNumber : null;
    const resolvedCity = city && city.trim() !== "" ? city : null;
    const resolvedPhone = phone && phone.trim() !== "" ? phone : null;

    // Insert user into database
    await pool.query(
      `INSERT INTO users (name, email, password, role, specialization, license_number, city, phone, is_verified, verification_token)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false, $9)`,
      [resolvedName, email, hashedPassword, resolvedRole, resolvedSpecialization, resolvedLicense, resolvedCity, resolvedPhone, verificationToken]
    );

    // Send Verification Email via Resend API (HTTP call - won't be blocked by host)
    const emailResult = await sendVerificationEmail(email, verificationToken);

    if (!emailResult.success) {
      console.warn("⚠️ User created, but verification email failed to send:", emailResult.error);
    }

    return res.status(201).json({
      message: "Registration successful! Please check your email to verify your account before logging in.",
    });

  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Server error during registration." });
  }
});

export default router;