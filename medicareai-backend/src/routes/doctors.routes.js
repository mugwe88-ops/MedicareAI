import express from "express";
import { getDoctorById, createDoctor } from "../models/Doctor.js";
import pool from "../utils/db.js";

const router = express.Router();

/**
 * GET /api/doctors
 * Fetches doctors and includes the new registration_number field
 */
router.get("/", async (req, res) => {
  try {
    const { city, query, q, specialization } = req.query;

    // Fixed Query: Includes registration_number
    // Ensure you have run: ALTER TABLE users ADD COLUMN specialty VARCHAR(255), ADD COLUMN registration_number VARCHAR(100);
    const result = await pool.query(
      "SELECT id, name, specialty, registration_number, city FROM users WHERE role = 'doctor' ORDER BY name ASC"
    );
    let doctors = result.rows;

    const searchTerm = (query || q || specialization || "").toString().trim().toLowerCase();
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
    // This logs the specific pg error (like the "column does not exist" error seen in Render)
    console.error("Doctors API error:", err); 
    res.status(500).json({ error: "Failed to fetch doctors" });
  }
});

/**
 * POST /api/doctors
 * Now expects specialty and registration_number in req.body
 */
router.post("/", async (req, res) => {
  try {
    // Ensure your createDoctor model function is updated to handle the new fields
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