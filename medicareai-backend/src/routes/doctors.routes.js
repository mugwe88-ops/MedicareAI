import express from "express";
import { getAllDoctors, getDoctorById, createDoctor } from "../models/Doctor.js";

const router = express.Router();

/**
 * GET /api/doctors
 * Updated to match frontend query params: ?city=Nairobi&q=Dermatology
 */
router.get("/", async (req, res) => {
  try {
    // 'q' comes from your Hero.tsx search input
    const { city, q } = req.query; 
    let doctors = await getAllDoctors();

    // Filter by City
    if (city && city.trim() !== "") {
      doctors = doctors.filter(d =>
        d.city?.toLowerCase().includes(city.toLowerCase())
      );
    }

    // Filter by Specialty/Name (using 'q' from frontend)
    if (q && q.trim() !== "") {
      const searchTerm = q.toLowerCase();
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