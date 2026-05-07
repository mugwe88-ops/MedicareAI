// backend/routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import pool from "../config/db.js"; 
import { verifyToken, signAccessToken } from "../utils/jwt.js"; // Use your utility!

const router = express.Router();

router.get("/me", verifyToken, async (req, res) => {
  try {
    // FIX: Changed [req.userId] to [req.user.id] to match middleware
    const result = await pool.query(
      "SELECT id, name, email, role FROM users WHERE id = $1",
      [req.user.id] 
    );
    
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("ME ROUTE ERROR:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Required fields missing" });

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) return res.status(401).json({ error: "Invalid credentials" });

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    // FIX: Use signAccessToken from your jwt.js to ensure Issuer/Audience match
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
    console.error("LOGIN ERROR:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;