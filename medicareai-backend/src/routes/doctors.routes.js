import express from "express";
import { getAllDoctors, getDoctorById, createDoctor } from "../models/Doctor.js";

const router = express.Router();

/**
 * GET /api/doctors
 * Optimized for fuzzy matching and frontend compatibility
 */
router.get("/", async (req, res) => {
  try {
    // Hero.tsx and api.ts send 'query' for specialization
    const { city, query, specialization } = req.query;
    
    // Normalize the search term: check 'query', then 'specialization'
    const searchTerm = (query || specialization || "").trim().toLowerCase();
    const cityTerm = (city || "").trim().toLowerCase();

    let doctors = await getAllDoctors();

    // 1. Filter by City (Fuzzy match)
    if (cityTerm !== "") {
      doctors = doctors.filter(d =>
        d.city?.toLowerCase().includes(cityTerm)
      );
    }

    // 2. Filter by Specialty or Name (Fuzzy match)
    if (searchTerm !== "") {
      doctors = doctors.filter(d =>
        // Use field names from your DB Model: full_name and specialization
        d.specialization?.toLowerCase().includes(searchTerm) || 
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

export default router;