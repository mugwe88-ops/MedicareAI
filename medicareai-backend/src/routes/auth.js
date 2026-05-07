import express from "express";
import bcrypt from "bcryptjs";
import pool from "../config/db.js"; 
import { verifyToken, signAccessToken } from "../utils/jwt.js"; 

const router = express.Router();

// ✅ GET /me
router.get("/me", verifyToken, async (req, res) => {
  try {
    // We use req.user.id because that's what verifyToken sets
    const result = await pool.query(
      "SELECT id, name, email, role FROM users WHERE id = $1",
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error("DATABASE ERROR IN /ME:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ POST /login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // CRITICAL: Use the helper to include Issuer and Audience
    const token = signAccessToken(user);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("LOGIN ROUTE FATAL ERROR:", err.message);
    res.status(500).json({ error: "Server error during login" });
  }
});

export default router;