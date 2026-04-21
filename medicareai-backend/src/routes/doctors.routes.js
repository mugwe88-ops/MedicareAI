import express from "express";
import { getAllDoctors, getDoctorById, createDoctor } from "../models/Doctor.js";

const router = express.Router();

/**
 * GET /api/doctors
 * Handles filtering by city and search query (name or specialty)
 */
router.get("/", async (req, res) => {
  try {
    // 1. Capture all possible frontend param names to be safe
    const { city, query, q, specialization } = req.query;

    // 2. Normalize terms (checks query, then q, then specialization)
    const searchTerm = (query || q || specialization || "").toString().trim().toLowerCase();
    const cityTerm = (city || "").toString().trim().toLowerCase();

    // 3. Fetch doctors from model
    let doctors = await getAllDoctors();

    // 4. Apply Fuzzy Filtering
    // Filtering by City
    if (cityTerm !== "") {
      doctors = doctors.filter(d => 
        d.city?.toLowerCase().includes(cityTerm)
      );
    }

    // Filtering by Name or Specialty
    if (searchTerm !== "") {
      doctors = doctors.filter(d => 
        // Ensure these match the ALIASED names in your Doctor.js model
        d.specialty?.toLowerCase().includes(searchTerm) || 
        d.full_name?.toLowerCase().includes(searchTerm)
      );
    }

    res.json(doctors);
  } catch (err) {
    console.error("Doctors API error:", err);
    res.status(500).json({ error: "Failed to fetch doctors" });
  }
});

/**
 * GET /api/doctors/:id
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
// Add this to your doctors.routes.js
router.post('/', async (req, res) => {
  try {
    const { name, specialization, bio, years_experience, clinic_name, city, consultation_fee, license_number } = req.body;
    
    const newDoctor = await pool.query(
      `INSERT INTO doctors (name, specialization, bio, years_experience, clinic_name, city, consultation_fee, license_number, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true) RETURNING *`,
      [name, specialization, bio, years_experience, clinic_name, city, consultation_fee, license_number]
    );
    
    res.status(201).json(newDoctor.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
export default router;
