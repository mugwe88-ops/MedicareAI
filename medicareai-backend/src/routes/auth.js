import express from 'express';
import bcrypt from 'bcrypt';
import axios from 'axios';
import pool from '../db.js';

const router = express.Router();

/* ==============================
   WHATSAPP SEND FUNCTION (NO CIRCULAR IMPORT)
================================ */
async function sendReply(phoneId, to, token, text) {
  if (!phoneId || !token || !to) {
    console.log("⚠️ WhatsApp skipped (missing env vars)");
    return;
  }

  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/${phoneId}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text }
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
  } catch (err) {
    console.error("❌ WhatsApp OTP Error:", err.response?.data || err.message);
  }
}

/* ==============================
   1️⃣ SESSION CHECK
================================ */
router.get('/me', async (req, res) => {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Not logged in" });
  }

  try {
    const { rows } = await pool.query(
      `SELECT id, name, email, role, phone, specialty, kmpdc_number 
       FROM users WHERE id=$1`,
      [req.session.userId]
    );

    res.json(rows[0]);
  } catch (e) {
    console.error("ME ERROR:", e);
    res.status(500).json({ error: "Database error" });
  }
});

/* ==============================
   2️⃣ SIGNUP
================================ */
router.post('/signup', async (req, res) => {
  const { name, email, password, role, phone, kmpdc_number } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000);
  const expiry = new Date(Date.now() + 10 * 60 * 1000);

  try {
    const hashed = await bcrypt.hash(password, 10);

    await pool.query(`
      INSERT INTO users (name,email,password,role,phone,email_otp,otp_expiry,kmpdc_number)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    `, [
      name,
      email.toLowerCase(),
      hashed,
      role || "patient",
      phone || null,
      otp,
      expiry,
      kmpdc_number || null
    ]);

    const msg = `Swift MD Verification Code: ${otp}`;
    await sendReply(
      process.env.WHATSAPP_PHONE_ID,
      phone,
      process.env.WHATSAPP_ACCESS_TOKEN,
      msg
    );

    res.json({ success: true, message: "OTP sent" });

  } catch (e) {
    console.error("SIGNUP ERROR:", e.message);
    if (e.code === "23505") {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Signup failed" });
  }
});

/* ==============================
   3️⃣ VERIFY OTP
================================ */
router.post('/verify', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const { rows } = await pool.query(
      "SELECT email_otp, otp_expiry FROM users WHERE email=$1",
      [email]
    );

    if (!rows.length) return res.status(400).json({ error: "User not found" });

    const user = rows[0];
    if (user.email_otp != otp) return res.status(400).json({ error: "Wrong OTP" });
    if (new Date() > user.otp_expiry) return res.status(400).json({ error: "OTP expired" });

    await pool.query(
      "UPDATE users SET is_verified=true, email_otp=NULL WHERE email=$1",
      [email]
    );

    res.json({ success: true });

  } catch (e) {
    console.error("OTP VERIFY ERROR:", e);
    res.status(500).json({ error: "Verify failed" });
  }
});

/* ==============================
   4️⃣ LOGIN
================================ */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { rows } = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email.toLowerCase()]
    );

    if (!rows.length) return res.status(401).json({ error: "Invalid credentials" });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    // Save session
    req.session.userId = user.id;
    req.session.role = user.role;

    req.session.save(err => {
      if (err) {
        console.error("SESSION SAVE ERROR:", err);
        return res.status(500).json({ error: "Session failed" });
      }

      res.json({
        success: true,
        role: user.role,
        name: user.name
      });
    });

  } catch (e) {
    console.error("LOGIN ERROR:", e);
    res.status(500).json({ error: "Login failed" });
  }
});

/* ==============================
   5️⃣ LOGOUT
================================ */
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid'); // default cookie name
    res.json({ success: true });
  });
});

export default router;
