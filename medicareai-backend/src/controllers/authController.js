import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";

// 1. Email Configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail
    pass: process.env.EMAIL_PASS, // Your 16-digit App Password
  },
});

// SIGNUP LOGIC
export const signup = async (req, res) => {
  const { email, password, name, role, specialization, license_number, city } = req.body;

  try {
    const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Insert user (is_verified defaults to false)
    const userResult = await pool.query(
      "INSERT INTO users (email, password, role, verification_token, is_verified) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [email, hashedPassword, role.toLowerCase(), verificationToken, false]
    );
    const userId = userResult.rows[0].id;

    // Handle Role Specific Data
    if (role.toLowerCase() === 'doctor') {
      await pool.query(
        `INSERT INTO doctors (user_id, name, specialization, license_number, city, is_active) 
         VALUES ($1, $2, $3, $4, $5, true)`,
        [userId, name, specialization, license_number, city]
      );
    } else {
      await pool.query("INSERT INTO patients (user_id, name) VALUES ($1, $2)", [userId, name]);
    }

    // Send Verification Email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    await transporter.sendMail({
      from: '"Swift MD" <no-reply@swiftmd.com>',
      to: email,
      subject: "Verify Your Account - Swift MD",
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #237BFF;">Welcome to Swift MD, ${name}!</h2>
          <p>Please click the button below to verify your email address and activate your account.</p>
          <a href="${verificationUrl}" style="background: #237BFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Verify Email</a>
          <p style="margin-top: 20px; font-size: 12px; color: #666;">If the button doesn't work, copy this link: ${verificationUrl}</p>
        </div>
      `
    });

    res.status(201).json({ message: "Signup successful! Check your email to verify your account." });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ message: "Registration failed on server" });
  }
};

// EMAIL VERIFICATION ENDPOINT
export const verifyEmail = async (req, res) => {
  const { token } = req.query;

  try {
    const result = await pool.query(
      "UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE verification_token = $1 RETURNING id",
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired verification link." });
    }

    res.json({ message: "Email verified successfully! You can now log in." });
  } catch (err) {
    console.error("Verification error:", err.message);
    res.status(500).json({ message: "Server error during verification." });
  }
};

// LOGIN LOGIC
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const user = result.rows[0];

    // Check Verification Status
    if (!user.is_verified) {
      return res.status(403).json({ 
        message: "Account not verified. Please check your email for the verification link." 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const payload = { userId: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "your_jwt_secret", {
      expiresIn: "24h",
    });

    res.json({
      token,
      role: user.role,
      message: "Login successful"
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Server error during login" });
  }
};

// Add this to your authController.js
export const getMe = async (req, res) => {
  try {
    // req.user is populated by your verifyToken middleware
    const result = await pool.query(
      "SELECT id, email, role, name FROM users WHERE id = $1", 
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};