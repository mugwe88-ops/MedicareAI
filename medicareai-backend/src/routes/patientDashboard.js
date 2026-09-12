import express from 'express';
import { createClient } from '@sanity/client';

const router = express.Router();

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATABASE || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
});

// GET /api/patient/dashboard-data
router.get('/dashboard-data', async (req, res) => {
  try {
    // Fetch relevant medical data/documents from Sanity
    // Adjust the GROQ query based on your Sanity schema
    const labReports = await client.fetch(`*[_type == "labReport"]{
      title,
      date,
      summary,
      "fileUrl": file.asset->url
    }`);

    const healthInsights = await client.fetch(`*[_type == "healthInsight"]{
      title,
      description,
      category
    }`);

    res.json({
      success: true,
      patientName: "Willy Weyru",
      labReports,
      healthInsights,
      upcomingAppointment: {
        title: "Cardiology Consultation",
        time: "Today at 2:00 PM",
        status: "CONFIRMED"
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;