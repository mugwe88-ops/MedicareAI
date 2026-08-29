import pool from "../utils/db.js";

// Controller to add a new lab result / diagnostic order
export const addLabResult = async (req, res) => {
  const { 
    patient_id, 
    record_type, 
    medication_details, 
    instructions, 
    clinical_instructions, 
    notes,
    status, 
    doctor_name,
    category 
  } = req.body;

  // Capture instruction/notes from multiple possible frontend property names
  const finalInstructions = instructions || clinical_instructions || notes || null;
  const finalDetails = category ? `${category}: ${medication_details}` : medication_details;

  try {
    const query = `
      INSERT INTO medical_records (patient_id, record_type, medication_details, instructions, status, doctor_name, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *;
    `;
    
    const values = [
      patient_id || req.user?.id, 
      record_type || 'diagnostic', 
      finalDetails, 
      finalInstructions, 
      status || 'Ordered', 
      doctor_name || req.user?.name || 'PRESSY PHIDES'
    ];
    
    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      message: "Diagnostic/Lab request added successfully",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Error adding lab result / diagnostic order:", error);
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
