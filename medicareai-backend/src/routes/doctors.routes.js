import express from "express";
import pool from "../utils/db.js";
import { verifyToken as authenticateToken } from "../utils/jwt.js";

const router = express.Router();

// Get all doctors for the directory (with search & category filtering)
router.get("/", async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = `
      SELECT id, name, specialization AS department, experience_years, avatar_url, phone, availability 
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

// ==========================================
// STATIC ROUTES (MUST BE BEFORE /:id ROUTES)
// ==========================================

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

router.get("/earnings", authenticateToken, async (req, res) => {
  try {
    const doctorId = req.user.id;

    const earningsRes = await pool.query(
      `SELECT * FROM doctor_earnings WHERE doctor_id = $1`,
      [doctorId]
    );

    const payoutsRes = await pool.query(
      `SELECT * FROM doctor_payouts WHERE doctor_id = $1 ORDER BY id DESC`,
      [doctorId]
    );

    const stats = earningsRes.rows[0] || {
      available_balance: 0,
      total_earned: 0,
      pending_clearance: 0,
      completed_sessions: 0
    };

    res.json({
      availableBalance: stats.available_balance,
      totalEarned: stats.total_earned,
      pendingClearance: stats.pending_clearance,
      completedSessions: stats.completed_sessions,
      payouts: payoutsRes.rows
    });
  } catch (err) {
    console.error("Error fetching earnings:", err);
    res.status(500).json({ message: "Failed to fetch financial data." });
  }
});

router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    let result = await pool.query(
      "SELECT id, name, email, specialization, bio, availability, status FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Doctor profile record not found in database. Try logging out and back in." });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching doctor profile:", err);
    res.status(500).json({ message: "Server error fetching profile." });
  }
});

router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, specialization, bio, availability, status } = req.body;

    const result = await pool.query(
      `UPDATE users 
       SET name = COALESCE($1, name), 
           email = COALESCE($2, email), 
           specialization = $3, 
           bio = $4, 
           availability = $5,
           status = COALESCE($6, status)
       WHERE id = $7 
       RETURNING id, name, email, specialization, bio, availability, status`,
      [name, email, specialization, bio, availability, status, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Doctor profile not found for update." });
    }

    res.json({
      message: "Profile updated successfully",
      profile: result.rows[0],
    });
  } catch (err) {
    console.error("Error updating doctor profile:", err);
    res.status(500).json({ message: "Server error updating profile changes." });
  }
});

// ✅ FIXED: Moved /performance here so it matches before /:id
router.get('/performance', authenticateToken, async (req, res) => {
  try {
    const doctorId = req.user.id;

    let result = await pool.query(
      'SELECT * FROM doctor_performance WHERE doctor_id = $1',
      [doctorId]
    );

    if (result.rows.length === 0) {
      result = await pool.query(
        `INSERT INTO doctor_performance (doctor_id) VALUES ($1) RETURNING *`,
        [doctorId]
      );
    }

    res.status(200).json({
      success: true,
      performance: result.rows[0],
    });
  } catch (error) {
    console.error('Error fetching doctor performance:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==========================================
// DYNAMIC PARAMETER ROUTES (/:id)
// ==========================================

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT id, name, specialization, consultation_fee, experience_years, avatar_url 
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

// GET /api/doctors/records?type=Lab Reports
router.get("/records", authenticateToken, async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { type } = req.query;

    let query = `SELECT id, record_type, primary_text, secondary_text, record_date, comments, status 
                 FROM medical_records 
                 WHERE doctor_id = $1`;
    const queryParams = [doctorId];

    if (type) {
      queryParams.push(type);
      query += ` AND record_type = $${queryParams.length}`;
    }

    query += ` ORDER BY id DESC`;

    const result = await pool.query(query, queryParams);
    
    // Fallback default row if none exist yet for this doctor
    if (result.rows.length === 0 && !type) {
      return res.json([
        { id: 1, record_type: 'Lab Reports', primary_text: 'Electrocardiography', secondary_text: 'Attending Physician', record_date: '28 Jan, 2026', comments: 'Normal vitals', status: 'Normal' }
      ]);
    }

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching medical records:", err);
    res.status(500).json({ message: "Server error fetching records" });
  }
});

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