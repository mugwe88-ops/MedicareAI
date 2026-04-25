import express from "express";
import bcrypt from "bcrypt";
import pool from "../utils/db.js";
const router = express.Router();
/* ======================
   PATIENT REGISTER / SIGNUP
====================== */
// Ensure this explicitly matches the frontend call
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body; //

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" }); //
    }

    const hashed = await bcrypt.hash(password, 10); //

    const result = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, 'patient')
       RETURNING id, name, email, role`,
      [name, email, hashed] //
    );

    res.status(201).json(result.rows[0]); //
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "Email already exists" }); //
    }
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" }); //
  }
});