import pool from "../config/db.js";

/**
 * @desc    Upload a new lab result (Used by Lab Technologists)
 * @route   POST /api/lab/results
 * @access  Private (Technician/Doctor)
 */
export const addLabResult = async (req, res) => {
  const { 
    patient_id, 
    test_id, 
    parameter_name, 
    result_value, 
    unit, 
    reference_range, 
    is_abnormal,
    lab_notes 
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO lab_results 
       (patient_id, doctor_id, test_id, parameter_name, result_value, unit, reference_range, is_abnormal, lab_notes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [
        patient_id, 
        req.userId, // Set from verifyToken middleware
        test_id, 
        parameter_name, 
        result_value, 
        unit, 
        reference_range, 
        is_abnormal,
        lab_notes
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error inserting lab result:", err);
    res.status(500).json({ error: "Failed to upload lab result" });
  }
};

/**
 * @desc    Get all lab results for the logged-in patient
 * @route   GET /api/lab/results/my-results
 * @access  Private (Patient)
 */
export const getMyResults = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM lab_results 
       WHERE patient_id = $1 
       ORDER BY reported_at DESC`,
      [req.userId] // Set from verifyToken middleware
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching patient results:", err);
    res.status(500).json({ error: "Failed to retrieve medical records" });
  }
};