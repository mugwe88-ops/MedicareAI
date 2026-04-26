import express from "express";
import { getAllDoctors, getDoctorById, createDoctor } from "../models/Doctor.js";

const router = express.Router();

/**
 * GET /api/doctors
 * Handles filtering by city and search query (name or specialty)
 */
router.get("/", async (req, res) => {
  try {
    const { city, query, q, specialization } = req.query;

    // Normalize terms
    const searchTerm = (query || q || specialization || "").toString().trim().toLowerCase();
    const cityTerm = (city || "").toString().trim().toLowerCase();

    let doctors = await getAllDoctors();

    // Apply Filtering
    if (cityTerm !== "") {
      doctors = doctors.filter(d => 
        (d.city || d.location)?.toLowerCase().includes(cityTerm)
      );
    }

    if (searchTerm !== "") {
      doctors = doctors.filter(d => 
        // FIX: Check both common naming conventions (specialization vs specialty)
        (d.specialization || d.specialty)?.toLowerCase().includes(searchTerm) || 
        (d.name || d.full_name)?.toLowerCase().includes(searchTerm)
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
 * Optimized to prevent "pool is not defined" and handle column naming
 */
router.post("/", async (req, res) => {
  try {
    // It is safer to use your createDoctor model function which should handle the pool logic
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