import express from "express";
import { getDoctorById, createDoctor } from "../models/Doctor.js";
import pool from "../utils/db.js";

const router = express.Router();

/**
 * GET /api/doctors
 * Fetches doctors from the 'users' table (since 'specialists' relation does not exist)
 */
router.get("/", async (req, res) => {
  try {
    // Added 'specialty' to the destructured query to catch frontend requests
    const { city, query, q, specialization, specialty } = req.query;

    // Database check: Pull from users table where role is doctor
    const result = await pool.query(
      "SELECT id, name, specialty, registration_number, city FROM users WHERE role = 'doctor' ORDER BY name ASC"
    );
    
    let doctors = result.rows;

    // Normalize search terms: Include 'specialty' in the fallback
    const searchTerm = (query || q || specialization || specialty || "").toString().trim().toLowerCase();
    const cityTerm = (city || "").toString().trim().toLowerCase();

    // 1. Filter by City if provided
    if (cityTerm !== "") {
      doctors = doctors.filter(d => d.city?.toLowerCase().includes(cityTerm));
    }

    // 2. Filter by Name or Specialty if search term provided
    if (searchTerm !== "") {
      doctors = doctors.filter(d => 
        d.specialty?.toLowerCase().includes(searchTerm) || 
        d.name?.toLowerCase().includes(searchTerm)
      );
    }

    res.json(doctors);
  } catch (err) {
    // Captures the errors seen in Render/Neon logs
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