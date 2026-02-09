import express from "express";
import pool from "../db.js";

const router = express.Router();

/* ================= CREATE APPOINTMENT ================= */
router.post("/", async (req, res) => {
  try {
    const { patient_name, phone, appointment_time } = req.body;

    const result = await pool.query(
      "INSERT INTO appointments (patient_name, phone, appointment_time) VALUES ($1,$2,$3) RETURNING *",
      [patient_name, phone, appointment_time]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Booking failed" });
  }
});

/* ================= GET ALL APPOINTMENTS ================= */
router.get("/", async (req, res) => {
  const result = await pool.query("SELECT * FROM appointments ORDER BY appointment_time DESC");
  res.json(result.rows);
});

/* ================= GET SINGLE APPOINTMENT ================= */
router.get("/:id", async (req, res) => {
  const result = await pool.query("SELECT * FROM appointments WHERE id=$1", [req.params.id]);
  res.json(result.rows[0]);
});

/* ================= UPDATE STATUS ================= */
router.put("/:id", async (req, res) => {
  const { status } = req.body;
  const result = await pool.query(
    "UPDATE appointments SET status=$1 WHERE id=$2 RETURNING *",
    [status, req.params.id]
  );
  res.json(result.rows[0]);
});

/* ================= DELETE APPOINTMENT ================= */
router.delete("/:id", async (req, res) => {
  await pool.query("DELETE FROM appointments WHERE id=$1", [req.params.id]);
  res.json({ message: "Deleted" });
});

export default router;
