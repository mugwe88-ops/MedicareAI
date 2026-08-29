import pool from "../utils/db.js"; // Adjust path to your DB pool if different

// Controller to add a new lab result / diagnostic order
export const addLabResult = async (req, res) => {
  const { patient_id, record_type, medication_details, instructions, status, doctor_name } = req.body;
  try {
    const query = `
      INSERT INTO medical_records (patient_id, record_type, medication_details, instructions, status, doctor_name, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *;
    `;
    
    const values = [
      patient_id || req.user?.id, 
      record_type || 'diagnostic', 
      medication_details, 
      instructions || null, // <-- Captures and saves clinical instructions properly
      status || 'Ordered', 
      doctor_name || req.user?.name || 'PRESSY PHIDES'
    ];
    
    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      message: "Lab request added successfully",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Error adding lab result:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Controller to get results for the logged-in patient
export const getMyResults = async (req, res) => {
  const patientId = req.user?.id;
  try {
    const query = `
      SELECT * FROM medical_records 
      WHERE patient_id = $1 
      ORDER BY created_at DESC;
    `;
    const result = await pool.query(query, [patientId]);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching lab results:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};
