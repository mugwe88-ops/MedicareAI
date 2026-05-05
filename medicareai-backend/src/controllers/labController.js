import pool from "../utils/db.js"; // Adjust path to your DB pool if different

// Controller to add a new lab result
export const addLabResult = async (req, res) => {
    const { patient_id, test_name, result_value, units, status } = req.body;
    try {
        const query = `
            INSERT INTO lab_results (patient_id, test_name, result_value, units, status, created_at)
            VALUES ($1, $2, $3, $4, $5, NOW())
            RETURNING *;
        `;
        const values = [patient_id, test_name, result_value, units, status || 'Pending'];
        const result = await pool.query(query, values);
        
        res.status(201).json({
            success: true,
            message: "Lab result added successfully",
            data: result.rows[0]
        });
    } catch (error) {
        console.error("Error adding lab result:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

// Controller to get results for the logged-in patient
export const getMyResults = async (req, res) => {
    // req.user.id comes from your verifyToken middleware
    const patientId = req.user.id; 
    try {
        const query = `
            SELECT * FROM lab_results 
            WHERE patient_id = $1 
            ORDER BY created_at DESC;
        `;
        const result = await pool.query(query, [patientId]);
        
        res.status(200).json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error("Error fetching lab results:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};