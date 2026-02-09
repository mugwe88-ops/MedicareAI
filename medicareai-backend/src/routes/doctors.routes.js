// src/routes/doctors.routes.js
import express from "express";
import { getAllDoctors, getDoctorById, createDoctor } from "../models/Doctor.js";

const router = express.Router();

/**
 * GET /api/doctors
 * Optional filters: ?city=Nairobi&specialization=Cardiology
 */
router.get("/", async (req, res) => {
  try {
    const { city, specialization } = req.query;
    let doctors = await getAllDoctors();

    // Simple filtering in JS (we can optimize later in SQL)
    if (city) {
      doctors = doctors.filter(d =>
        d.city?.toLowerCase() === city.toLowerCase()
      );
    }

    if (specialization) {
      doctors = doctors.filter(d =>
        d.specialization?.toLowerCase() === specialization.toLowerCase()
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
 * Admin only later
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
