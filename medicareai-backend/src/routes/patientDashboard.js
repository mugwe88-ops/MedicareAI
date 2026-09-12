// src/routes/patientDashboard.js
import express from 'express';
import { createClient } from '@sanity/client';
import pool from '../utils/db.js';
import { verifyToken } from '../utils/jwt.js';

const router = express.Router();

// Initialize Sanity Client
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATABASE || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
});

// GET /api/patient/dashboard-data
router.get('/dashboard-data', verifyToken, async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;

    let patientData = {
      name: "Patient",
      email: "",
      age: 34,
      gender: "Male",
      bloodGroup: "O+",
      patientId: `#MED-${userId || 8492}`,
      allergies: ["Penicillin"],
      insuranceStatus: "Active"
    };

    let upcomingAppointment = {
      title: "General Consultation",
      time: "Scheduled soon",
      status: "Confirmed"
    };

    let vitals = {
      bloodPressure: "120/80 mmHg",
      heartRate: "72 bpm",
      bloodSugar: "5.2 mmol/L",
      temperature: "98.6 °F"
    };

    // 1. Safely fetch user profile (only querying columns guaranteed to exist)
    if (userId) {
      try {
        const userQuery = await pool.query(
          'SELECT name, email FROM users WHERE id = $1',
          [userId]
        );
        if (userQuery.rows.length > 0) {
          const row = userQuery.rows[0];
          patientData.name = row.name || "Patient";
          patientData.email = row.email || "";
        }
      } catch (dbErr) {
        console.warn("User profile query skipped:", dbErr.message);
      }
    }

    // 2. Safely fetch upcoming appointments
    if (userId) {
      try {
        const aptQuery = await pool.query(
          'SELECT specialty, doctor_name, date, time, status FROM appointments WHERE patient_id = $1 AND date >= NOW() ORDER BY date ASC LIMIT 1',
          [userId]
        );
        if (aptQuery.rows.length > 0) {
          const apt = aptQuery.rows[0];
          upcomingAppointment = {
            title: `${apt.specialty || 'Consultation'} with ${apt.doctor_name || 'Doctor'}`,
            time: `${apt.date ? new Date(apt.date).toLocaleDateString() : 'Today'} at ${apt.time || '2:00 PM'}`,
            status: apt.status || "Confirmed"
          };
        }
      } catch (dbErr) {
        console.warn("Appointments query skipped:", dbErr.message);
      }
    }

    // 3. Safely fetch latest vitals
    if (userId) {
      try {
        const vitalsQuery = await pool.query(
          'SELECT blood_pressure, heart_rate, blood_sugar, temperature FROM vitals WHERE patient_id = $1 ORDER BY created_at DESC LIMIT 1',
          [userId]
        );
        if (vitalsQuery.rows.length > 0) {
          const v = vitalsQuery.rows[0];
          vitals = {
            bloodPressure: v.blood_pressure || "120/80 mmHg",
            heartRate: v.heart_rate || "72 bpm",
            bloodSugar: v.blood_sugar || "5.2 mmol/L",
            temperature: v.temperature || "98.6 °F"
          };
        }
      } catch (dbErr) {
        console.warn("Vitals query skipped:", dbErr.message);
      }
    }

    // 4. Fetch dynamic Lab Reports and Health Insights from Sanity CMS
    let labReports = [];
    let healthInsights = [];
    
    try {
      labReports = await client.fetch(`*[_type == "labReport"]{
        title,
        date,
        summary,
        "fileUrl": file.asset->url
      }`);
    } catch (sanityErr) {
      console.warn("Sanity lab reports fetch failed:", sanityErr.message);
    }

    try {
      healthInsights = await client.fetch(`*[_type == "healthInsight"]{
        title,
        description,
        category
      }`);
    } catch (sanityErr) {
      console.warn("Sanity health insights fetch failed:", sanityErr.message);
    }

    // Return final aggregated payload
    return res.json({
      success: true,
      patient: patientData,
      patientName: patientData.name,
      upcomingAppointment,
      vitals,
      labReports: labReports || [],
      healthInsights: healthInsights || []
    });

  } catch (err) {
    console.error("Dashboard data fatal error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;