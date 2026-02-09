import express from "express";
import bcrypt from "bcrypt";
import pool from "../db.js";// ✅ PostgreSQL pool
import { signAccessToken, signRefreshToken } from "../utils/jwt.js";
import pool from "../db.js";

export async function initDB() {
  try {
    await pool.query("SELECT 1");
    console.log("PostgreSQL connected");
  } catch (err) {
    console.error("DB init failed:", err);
  }
}
async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'patient',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log("Database initialized");
  } catch (err) {
    console.error("Database initialization failed:", err);
  }
}
const router = express.Router();

/* ================= REGISTER ================= */
router.post("/signup", async (req, res) => {
  try {
    let { name, email, password, role = "patient" } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    email = email.toLowerCase().trim();

    const existing = await pool.query(
      "SELECT id FROM users WHERE email=$1",
      [email]
    );
    if (existing.rows.length) {
      return res.status(409).json({ error: "User already exists" });
    }

    const hash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1,$2,$3,$4)
       RETURNING id, email, role`,
      [name, email, hash, role]
    );

    const user = result.rows[0];

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    res.json({ accessToken, refreshToken });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Signup failed" });
  }
});

/* ================= LOGIN ================= */
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Missing credentials" });
    }

    email = email.toLowerCase().trim();

    const result = await pool.query(
      "SELECT id, email, password, role FROM users WHERE email=$1",
      [email]
    );

    if (!result.rows.length) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const payload = { id: user.id, email: user.email, role: user.role };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    res.json({ accessToken, refreshToken });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

export default router;
