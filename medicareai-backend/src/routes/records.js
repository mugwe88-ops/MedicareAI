const express = require('express');
const router = express.Router();
const pool = require('../utils/db'); // Adjust based on your Neon DB pool setup
const { decryptData } = require('../utils/encryption'); // Your decryption helper
const authenticateToken = require('../middleware/auth'); // Your JWT auth middleware

router.get('/', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT * FROM medical_records 
      WHERE patient_id = $1 
      ORDER BY created_at DESC
    `;
    const { rows } = await pool.query(query, [req.user.id]);

    const processedRows = rows.map(record => {
      try {
        return {
          ...record,
          clinical_notes: record.is_encrypted ? decryptData(record.clinical_notes) : record.clinical_notes,
          test_ordered: record.is_encrypted ? decryptData(record.test_ordered) : record.test_ordered,
          test_name: record.is_encrypted ? decryptData(record.test_name) : record.test_name,
          medication_details: record.is_encrypted ? decryptData(record.medication_details) : record.medication_details,
          instructions: record.is_encrypted ? decryptData(record.instructions) : record.instructions,
          clinical_instructions: record.is_encrypted ? decryptData(record.clinical_instructions) : record.clinical_instructions,
        };
      } catch (err) {
        console.error("Failed to decrypt record ID:", record.id);
        return record;
      }
    });

    res.json(processedRows);
  } catch (err) {
    console.error("Error fetching medical records:", err);
    res.status(500).json({ error: "Failed to fetch medical records" });
  }
});

export default router;
