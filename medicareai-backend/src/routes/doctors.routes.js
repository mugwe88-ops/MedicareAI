import express from "express";
import { getAllDoctors, getDoctorById, createDoctor } from "../models/Doctor.js";
import pool from "../utils/db.js";

const router = express.Router();

/**
 * GET /api/doctors
 * Consolidated route to fetch doctors with real IDs from the DB
 */
router.get("/", async (req, res) => {
  try {
    const { city, query, q, specialization } = req.query;

    // 1. Fetch from DB using the pool directly to ensure we get IDs
    const result = await pool.query(
      "SELECT id, name, specialty, city FROM users WHERE role = 'doctor' ORDER BY name ASC"
    );
    let doctors = result.rows;

    // 2. Normalize terms for optional filtering
    const searchTerm = (query || q || specialization || "").toString().trim().toLowerCase();
    const cityTerm = (city || "").toString().trim().toLowerCase();

    // 3. Apply Filtering logic if params exist
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