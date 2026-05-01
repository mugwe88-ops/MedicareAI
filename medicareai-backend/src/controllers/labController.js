import { pool } from "../config/db.js";

export const addLabResult = async (req, res) => {
  const { patient_id, test_id, parameter_name, result_value, unit, reference_range, is_abnormal } = req.body;
  
  try {
    const result = await pool.query(
      `INSERT INTO lab_results 
       (patient_id, doctor_id, test_id, parameter_name, result_value, unit, reference_range, is_abnormal) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [patient_id, req.userId, test_id, parameter_name, result_value, unit, reference_range, is_abnormal]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to upload lab result" });
  }
};