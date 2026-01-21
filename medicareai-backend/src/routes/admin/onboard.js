import express from "express";
import pool from "../../db.js"; // Your PostgreSQL connection

const router = express.Router();

// 💡 Change this to a long random string in your Render Environment Variables!
const ADMIN_SECRET = process.env.ADMIN_SECRET || "my_super_secret_key_2026";

/**
 * POST /api/admin/onboard
 * Body: { "name", "phone_id", "token", "booking_url" }
 */
router.post("/", async (req, res) => {
  const { name, phone_id, token, booking_url, secret } = req.body;

  // 1. Security Check
  if (secret !== ADMIN_SECRET) {
    return res.status(401).json({ error: "Unauthorized: Invalid Secret Key" });
  }

  // 2. Validation
  if (!name || !phone_id || !token || !booking_url) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const query = `
      INSERT INTO consultants (name, whatsapp_phone_id, whatsapp_access_token, booking_url)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (whatsapp_phone_id) 
      DO UPDATE SET name = $1, whatsapp_access_token = $3, booking_url = $4
      RETURNING *;
    `;
    const values = [name, phone_id, token, booking_url];
    const result = await pool.query(query, values);

    console.log(`✅ Consultant ${name} onboarded successfully!`);
    res.status(201).json({ message: "Success", consultant: result.rows[0] });
  } catch (err) {
    console.error("❌ Database Error:", err.message);
    res.status(500).json({ error: "Database insertion failed" });
  }
});

export default router;