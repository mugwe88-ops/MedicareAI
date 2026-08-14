import express from "express";
import { getDoctorById, createDoctor } from "../models/Doctor.js";
import pool from "../utils/db.js";

const router = express.Router();

/**
 * Shared controller for updating doctor status.
 * Handles both POST and PATCH requests to prevent method mismatches.
 */
const updateStatusHandler = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status field is required." });
    }

    // Logging for debugging on Render / Neon
    console.log(`Doctor status updated to: ${status}`);

    // If you have a column in your 'users' or 'doctors' table, update it here:
    // await pool.query("UPDATE users SET status = $1 WHERE role = 'doctor'", [status]);

    return res.status(200).json({
      success: true,
      message: "Doctor status updated successfully",
      status,
    });
  } catch (err) {
    console.error("Status update error:", err);
    return res.status(500).json({ error: "Failed to update doctor status" });
  }
};

/**
 * POST & PATCH /api/doctors/status AND /api/doctor/status
 * Handles provider status updates (Available, In Visit, On Break)
 */
router.post("/status", updateStatusHandler);
router.patch("/status", updateStatusHandler);

/**
 * GET /api/doctors
 * Fetches doctors from the 'users' table
 */
router.get("/", async (req, res) => {
  try {
    const { city, query, q, specialization, specialty } = req.query;

    const result = await pool.query(
      "SELECT id, name, specialty, registration_number, city FROM users WHERE role = 'doctor' ORDER BY name ASC"
    );
    
    let doctors = result.rows;

    const searchTerm = (query || q || specialization || specialty || "").toString().trim().toLowerCase();
    const cityTerm = (city || "").toString().trim().toLowerCase();

    if (cityTerm !== "") {
      doctors = doctors.filter(d => d.city?.toLowerCase().includes(cityTerm));
    }

    if (searchTerm !== "") {
      doctors = doctors.filter(d => 
        d.specialty?.toLowerCase().includes(searchTerm) || 
        d.name?.toLowerCase().includes(searchTerm)
      );
    }

    res.json(doctors);
  } catch (err) {
    console.error("Doctors API error:", err); 
    res.status(500).json({ error: "Failed to fetch doctors" });
  }
});

/**
 * POST /api/doctors
 */
router.post("/", async (req, res) => {
  try {
    const doctor = await createDoctor(req.body);
    res.status(201).json(doctor);
  } catch (err) {
    console.error("Create doctor error:", err);
    res.status(500).json({ error: "Failed to create doctor" });
  }
});

/**
 * POST /api/doctors/prescriptions
 * Issues and stores a new prescription record
 */
router.post("/prescriptions", async (req, res) => {
  try {
    const { patient_name, medication_details, doctor_id } = req.body;

    if (!patient_name || !medication_details) {
      return res.status(400).json({ error: "Patient name and medication details are required." });
    }

    const result = await pool.query(
      `INSERT INTO prescriptions (doctor_id, patient_name, medication_details)
       VALUES ($1, $2, $3) RETURNING *`,
      [doctor_id || null, patient_name, medication_details]
    );

    return res.status(201).json({
      success: true,
      message: "Prescription issued successfully",
      prescription: result.rows[0],
    });
  } catch (err) {
    console.error("Prescription issuance error:", err);
    return res.status(500).json({ error: "Failed to store prescription record" });
  }
});

/**
 * GET /api/doctors/:id (Keep below static sub-routes like /status)
 */
router.get("/:id", async (req, res) => {
  try {
    const doctor = await getDoctorById(req.params.id);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });
    res.json(doctor);
  } catch (err) {
    console.error("Doctor fetch error:", err);
    res.status(500).json({ error: "Failed to fetch doctor" });
  }
});

export default router;