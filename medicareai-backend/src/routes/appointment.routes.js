import express from "express";
import jwt from "jsonwebtoken";
import pool from "../utils/db.js";

const router = express.Router();

/* Middleware to verify JWT and extract user context */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. No authentication token provided." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Session expired or token authentication failed." });
  }
};

/* ================= GET DOCTOR SPECIFIC APPOINTMENTS ================= */
router.get("/doctor", authenticateToken, async (req, res) => {
  try {
    if (req.user.role?.toLowerCase() !== "doctor") {
      return res.status(403).json({ error: "Access forbidden. Account requires doctor privileges." });
    }

    const doctorId = parseInt(req.user.userId, 10);

    const result = await pool.query(
      `SELECT 
        a.*, 
        COALESCE(a.patient_name, u.name, 'Unknown Patient') AS patient_name,
        COALESCE(a.phone, u.phone, 'N/A') AS phone,
        u.medical_history AS patient_medical_history,
        u.age AS patient_age,
        u.chronic_conditions AS patient_chronic_conditions,
        u.allergies AS patient_allergies,
        u.surgeries AS patient_surgeries
       FROM appointments a
       LEFT JOIN users u ON a.patient_id = u.id
       WHERE a.doctor_id = $1
       ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
      [doctorId]
    );

    return res.json(result.rows || []);
  } catch (err) {
    console.error("Doctor Appointment Fetch Error:", err.message);
    return res.status(500).json({ error: "Could not fetch doctor appointments." });
  }
});

/* ================= CREATE APPOINTMENT (ROOT) ================= */
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { department, doctor_id, appointment_date, appointment_time, reason, patient_name, phone } = req.body;
    
    const patientId = parseInt(req.user.userId, 10);

    if (!appointment_date || !appointment_time) {
      return res.status(400).json({ error: "Missing required fields: appointment_date and appointment_time." });
    }

    const parsedDoctorId = doctor_id ? parseInt(doctor_id, 10) : null;

    let nameToInsert = patient_name;
    let phoneToInsert = phone;

    if (!nameToInsert || !phoneToInsert) {
      const userRes = await pool.query("SELECT name, phone FROM users WHERE id = $1", [patientId]);
      if (userRes.rows.length > 0) {
        nameToInsert = nameToInsert || userRes.rows[0].name || "Patient";
        phoneToInsert = phoneToInsert || userRes.rows[0].phone || "N/A";
      }
    }

    // Check for double booking
    if (parsedDoctorId) {
      const conflictCheck = await pool.query(
        `SELECT id FROM appointments 
         WHERE doctor_id = $1 AND appointment_date = $2 AND appointment_time = $3 AND status != 'Cancelled'`,
        [parsedDoctorId, appointment_date, appointment_time]
      );

      if (conflictCheck.rows.length > 0) {
        return res.status(409).json({ 
          error: "This time slot is already booked for the selected doctor. Please choose a different time." 
        });
      }
    }

    const result = await pool.query(
      `INSERT INTO appointments (patient_name, phone, appointment_date, appointment_time, department, doctor_id, patient_id, reason, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Confirmed') 
       RETURNING *`,
      [
        nameToInsert,
        phoneToInsert,
        appointment_date,
        appointment_time,
        department || 'General Medicine',
        parsedDoctorId,
        patientId,
        reason || 'General Consultation'
      ]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("CRITICAL DB ERROR:", err.message); 
    return res.status(500).json({ error: "Booking failed", details: err.message });
  }
});

/* ================= CREATE APPOINTMENT (/book) ================= */
router.post("/book", authenticateToken, async (req, res) => {
  try {
    const { 
      department, 
      doctor_id, 
      appointment_date, 
      appointment_time, 
      reason, 
      patient_name, 
      phone,
      symptom_severity,
      symptom_duration,
      body_system,
      associated_symptoms,
      pain_scale 
    } = req.body;
    
    const patientId = parseInt(req.user.userId, 10);

    if (!appointment_date || !appointment_time) {
      return res.status(400).json({ error: "Missing required fields: appointment_date and appointment_time." });
    }

    const parsedDoctorId = doctor_id ? parseInt(doctor_id, 10) : null;

    let nameToInsert = patient_name;
    let phoneToInsert = phone;

    if (!nameToInsert || !phoneToInsert) {
      const userRes = await pool.query("SELECT name, phone FROM users WHERE id = $1", [patientId]);
      if (userRes.rows.length > 0) {
        nameToInsert = nameToInsert || userRes.rows[0].name || "Patient";
        phoneToInsert = phoneToInsert || userRes.rows[0].phone || "N/A";
      }
    }

    // Build questionnaire text from submitted fields
    let finalReason = reason;
    if (symptom_severity || body_system) {
      const questionnaireParts = [];
      if (reason) questionnaireParts.push(`Chief Complaint: ${reason}`);
      if (body_system) questionnaireParts.push(`Body System: ${body_system}`);
      if (symptom_severity) questionnaireParts.push(`Severity: ${symptom_severity}`);
      if (symptom_duration) questionnaireParts.push(`Duration: ${symptom_duration}`);
      if (associated_symptoms) questionnaireParts.push(`Associated Symptoms: ${associated_symptoms}`);
      if (pain_scale) questionnaireParts.push(`Pain Scale: ${pain_scale}/10`);
      finalReason = questionnaireParts.join(" | ");
    }

    // Persist questionnaire directly into user's profile medical history
    if (finalReason) {
      await pool.query(
        `UPDATE users SET medical_history = $1 WHERE id = $2`,
        [finalReason, patientId]
      );
    }

    // Check for double booking
    if (parsedDoctorId) {
      const conflictCheck = await pool.query(
        `SELECT id FROM appointments 
         WHERE doctor_id = $1 AND appointment_date = $2 AND appointment_time = $3 AND status != 'Cancelled'`,
        [parsedDoctorId, appointment_date, appointment_time]
      );

      if (conflictCheck.rows.length > 0) {
        return res.status(409).json({ 
          error: "This time slot is already booked for the selected doctor. Please choose a different time." 
        });
      }
    }

    const result = await pool.query(
      `INSERT INTO appointments (patient_name, phone, appointment_date, appointment_time, department, doctor_id, patient_id, reason, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Confirmed') 
       RETURNING *`,
      [
        nameToInsert,
        phoneToInsert,
        appointment_date,
        appointment_time,
        department || 'General Medicine',
        parsedDoctorId,
        patientId,
        finalReason || 'General Consultation'
      ]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("CRITICAL DB ERROR:", err.message); 
    return res.status(500).json({ error: "Booking failed", details: err.message });
  }
});

/* ================= GET FILTERED / MY APPOINTMENTS ================= */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.user.userId, 10);
    const userRole = req.user.role?.toLowerCase();

    let query = "";
    let queryParams = [];

    if (userRole === "doctor") {
      query = `
        SELECT a.*, COALESCE(u.name, 'Patient') as patient_name 
        FROM appointments a 
        LEFT JOIN users u ON a.patient_id = u.id 
        WHERE a.doctor_id = $1 
        ORDER BY a.appointment_date DESC, a.appointment_time DESC`;
      queryParams = [userId];
    } else {
      // Patient view: Join with doctors table to return correct doctor_name
      query = `
        SELECT a.*, COALESCE(d.name, 'Assigned Doctor') as doctor_name 
        FROM appointments a 
        LEFT JOIN doctors d ON a.doctor_id = d.id 
        WHERE a.patient_id = $1 
        ORDER BY a.appointment_date DESC, a.appointment_time DESC`;
      queryParams = [userId];
    }

    const result = await pool.query(query, queryParams);
    return res.json(result.rows || []);
  } catch (err) {
    console.error("Fetch Appointments Error:", err.message);
    return res.status(500).json({ error: "Could not fetch appointments." });
  }
});

/* ================= UPDATE STATUS ================= */
router.put("/:id/status", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status value is required." });
    }

    const result = await pool.query(
      "UPDATE appointments SET status=$1 WHERE id=$2 RETURNING *",
      [status, parseInt(id, 10)]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error("Update Error:", err.message);
    return res.status(500).json({ error: "Update failed" });
  }
});

/* ================= UPDATE / CANCEL APPOINTMENT BY ID ================= */
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Expects { status: "CANCELLED" }
    const appointmentId = parseInt(id, 10);
    const newStatus = status || "CANCELLED";

    const result = await pool.query(
      `UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *`,
      [newStatus, appointmentId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Appointment not found." });
    }

    return res.json({ 
      message: "Appointment updated successfully", 
      updatedAppointment: result.rows[0] 
    });
  } catch (err) {
    console.error("Error updating appointment:", err.message);
    return res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

/* ================= DEDICATED RESCHEDULE APPOINTMENT ROUTE ================= */
router.put("/:id/reschedule", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { appointment_date, appointment_time } = req.body;
    const appointmentId = parseInt(id, 10);

    if (!appointment_date || !appointment_time) {
      return res.status(400).json({ error: "New appointment date and time are required." });
    }

    const result = await pool.query(
      `UPDATE appointments 
       SET appointment_date = $1, appointment_time = $2, status = 'Confirmed' 
       WHERE id = $3 RETURNING *`,
      [appointment_date, appointment_time, appointmentId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Appointment not found." });
    }

    return res.json({ 
      message: "Appointment rescheduled successfully", 
      updatedAppointment: result.rows[0] 
    });
  } catch (err) {
    console.error("Reschedule Error:", err.message);
    return res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

/* ================= DELETE APPOINTMENT BY ID ================= */
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const appointmentId = parseInt(id, 10);

    const result = await pool.query(
      `DELETE FROM appointments WHERE id = $1 RETURNING *`,
      [appointmentId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Appointment not found." });
    }

    return res.json({ message: "Appointment cancelled/deleted successfully." });
  } catch (err) {
    console.error("Error deleting appointment:", err.message);
    return res.status(500).json({ error: "Internal server error", details: err.message });
  }
});

/* ================= UPDATE QUESTIONNAIRE PROFILE ================= */
router.put("/profile/questionnaire", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { age, phone, chronic_conditions, allergies, surgeries } = req.body;

    await pool.query(
      `UPDATE users 
       SET age = $1, phone = $2, chronic_conditions = $3, allergies = $4, surgeries = $5 
       WHERE id = $6`,
      [age, phone, chronic_conditions, allergies, surgeries, userId]
    );

    return res.json({ success: true, message: "Questionnaire profile saved successfully!" });
  } catch (err) {
    console.error("Profile Save Error:", err.message);
    return res.status(500).json({ error: "Failed to save questionnaire profile." });
  }
});

export default router;
