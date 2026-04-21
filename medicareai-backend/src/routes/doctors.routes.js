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
router.get("/", async (req, res) => {
  try {
    // 1. Capture every possible parameter name the frontend might use
    // Your Hero.tsx uses 'query'
    // Your previous code used 'specialization'
    const { city, query, q, specialization } = req.query;

    // 2. Determine the search term (prioritize 'query' from your URL)
    const searchTerm = (query || q || specialization || "").toString().trim().toLowerCase();
    const cityTerm = (city || "").toString().trim().toLowerCase();

    // 3. Get active doctors from PostgreSQL
    let doctors = await getAllDoctors();

    // 4. Apply Fuzzy Filtering
    if (cityTerm !== "") {
      doctors = doctors.filter(d => 
        d.city?.toLowerCase().includes(cityTerm)
      );
    }

    if (searchTerm !== "") {
      doctors = doctors.filter(d => 
        // Using includes() ensures "Dermatology" matches "Dermatologist"
        d.specialization?.toLowerCase().includes(searchTerm) || 
        d.full_name?.toLowerCase().includes(searchTerm)
      );
    }

    // 5. Send results back to the Vercel frontend
    res.json(doctors);
  } catch (err) {
    console.error("Doctors API error:", err);
    res.status(500).json({ error: "Failed to fetch doctors" });
  }
});
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