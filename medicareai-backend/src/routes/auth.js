// src/routes/auth.js
import express from "express";
import bcrypt from "bcrypt";
import pool from "../db.js";
import { sendReply } from "../server.js";

const router = express.Router();

/* ============================
   SESSION CHECK
============================ */
router.get("/me", async (req, res) => {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Not logged in" });
  }

  try {
    const { rows } = await pool.query(
      "SELECT id, name, email, role, phone, specialty, kmpdc_number FROM users WHERE id=$1",
      [req.session.userId]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error("ME ERROR:", err);
    res.status(500).json({ error: "Database error" });
  }
});

/* ============================
   SIGNUP
============================ */
router.post("/signup", async (req, res) => {
  const { name, email, password, role, phone, kmpdc_number } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Missing email or password" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = new Date(Date.now() + 10 * 60 * 1000);

  try {
    const hashed = await bcrypt.hash(password, 10);

    await pool.query(
      `
      INSERT INTO users (name,email,password,role,phone,email_otp,otp_expiry,kmpdc_number)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      ON CONFLICT (email) DO NOTHING
      `,
      [name || "User", email, hashed, role || "patient", phone || null, otp, expiry, kmpdc_number || null]
    );

    // Send OTP (optional)
    if (phone) {
      await sendReply(
        process.env.WHATSAPP_PHONE_ID,
        phone,
        process.env.WHATSAPP_ACCESS_TOKEN,
        `Swift MD OTP: ${otp}`
      );
    }

    res.json({ success: true, message: "OTP sent" });
  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    res.status(500).json({ error: "Signup failed" });
  }
});

/* ============================
   LOGIN
============================ */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    const user = result.rows[0];

    if (!user) return res.status(401).json({ error: "User not found" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Wrong password" });

    req.session.userId = user.id;
    req.session.role = user.role;

    req.session.save((err) => {
      if (err) {
        console.error("SESSION SAVE ERROR:", err);
        return res.status(500).json({ error: "Session failed" });
      }
      res.json({ success: true, role: user.role });
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

/* ============================
   LOGOUT
============================ */
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ success: true });
  });
});

export default router;
