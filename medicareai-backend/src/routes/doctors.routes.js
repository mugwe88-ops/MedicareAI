import express from "express";
import pool from "../utils/db.js";
import { verifyToken as authenticateToken } from "../utils/jwt.js";

const router = express.Router();

// Get all doctors for the directory (with search & category filtering)
router.get("/", async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = `
      SELECT id, name, email, specialization AS department, experience_years, avatar_url, phone, availability 
      FROM consultants 
      WHERE role = 'doctor'
    `;
    const queryParams = [];

    if (search) {
      queryParams.push(`%${search}%`);
      query += ` AND (name ILIKE $${queryParams.length} OR specialization ILIKE $${queryParams.length})`;
    }

    if (category && category !== 'All') {
      queryParams.push(`%${category}%`);
      query += ` AND specialization ILIKE $${queryParams.length}`;
    }

    query += ` ORDER BY id ASC`;

    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching doctors list:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ MUST BE PLACED BEFORE /:id to prevent Express from treating "patients" as an ID parameter
router.get("/patients", authenticateToken, async (req, res) => {
  try {
    const doctorId = req.user.id;

    const result = await pool.query(
      `SELECT id, patient_code as id_str, name, age, gender, condition, last_visit, phone, email, status, bp, heart_rate, temp 
       FROM patients 
       WHERE doctor_id = $1 
       ORDER BY created_at DESC`,
      [doctorId]
    );

    // Map rows to match the frontend TypeScript interface structure
    const formattedPatients = result.rows.map(row => ({
      id: row.id_str || `PT-00${row.id}`,
      name: row.name,
      age: row.age || 30,
      gender: row.gender || 'Not Specified',
      condition: row.condition || 'General Evaluation',
      lastVisit: row.last_visit || 'Recent',
      phone: row.phone || 'N/A',
      email: row.email || 'N/A',
      status: row.status || 'Stable',
      vitals: {
        bp: row.bp || '120/80 mmHg',
        heartRate: row.heart_rate || '72 bpm',
        temp: row.temp || '98.6°F'
      }
    }));

    res.json(formattedPatients);
  } catch (err) {
    console.error("Error fetching patient records:", err);
    res.status(500).json({ message: "Failed to fetch patient records from the database." });
  }
});

// Get doctor details / profile (Dynamic parameter route comes AFTER static routes)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT id, name, email, specialization, consultation_fee, experience_years, avatar_url 
       FROM consultants 
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching doctor:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get doctor's availability slots
router.get("/:id/availability", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT id, doctor_id, day_of_week, start_time, end_time 
       FROM doctor_availability 
       WHERE doctor_id = $1 
       ORDER BY 
         CASE day_of_week
           WHEN 'Monday' THEN 1
           WHEN 'Tuesday' THEN 2
           WHEN 'Wednesday' THEN 3
           WHEN 'Thursday' THEN 4
           WHEN 'Friday' THEN 5
           WHEN 'Saturday' THEN 6
           WHEN 'Sunday' THEN 7
         END, start_time`,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching doctor availability:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Add a doctor's availability slot (Protected)
router.post("/:id/availability", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { day_of_week, start_time, end_time } = req.body;

    if (req.user.id !== parseInt(id, 10)) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    if (!day_of_week || !start_time || !end_time) {
      return res.status(400).json({ message: "Missing required availability fields" });
    }

    const result = await pool.query(
      `INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [id, day_of_week, start_time, end_time]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error adding doctor availability:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete doctor availability slot (Protected)
router.delete("/:id/availability/:slotId", authenticateToken, async (req, res) => {
  try {
    const { id, slotId } = req.params;

    if (req.user.id !== parseInt(id, 10)) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const result = await pool.query(
      `DELETE FROM doctor_availability 
       WHERE id = $1 AND doctor_id = $2 
       RETURNING *`,
      [slotId, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Availability slot not found" });
    }

    res.json({ message: "Availability slot deleted successfully" });
  } catch (err) {
    console.error("Error deleting doctor availability:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;