import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Required for cloud databases
});

/**
 * Fetch all appointments for a specific doctor
 */
export const getDoctorAppointments = async (doctorId) => {
  try {
    // We use a JOIN to replicate Prisma's 'include: { patient: true }'
    const query = `
      SELECT 
        a.*, 
        p.name as patient_name, 
        p.email as patient_email 
      FROM "Appointment" a
      LEFT JOIN "Patient" p ON a.patient_id = p.id
      WHERE a.doctor_id = $1
      ORDER BY a.appointment_date ASC
    `;
    
    const result = await pool.query(query, [doctorId]);
    return result.rows; // Returns the array of appointments with patient details
  } catch (error) {
    console.error('❌ Error fetching doctor appointments:', error);
    throw error;
  }
};

/**
 * Create a new appointment
 */
export const createAppointment = async (data) => {
  const { doctorId, patientId, appointmentDate, reason } = data;
  
  try {
    const query = `
      INSERT INTO "Appointment" (doctor_id, patient_id, appointment_date, reason, status)
      VALUES ($1, $2, $3, $4, 'PENDING')
      RETURNING *
    `;
    
    const values = [doctorId, patientId, appointmentDate, reason];
    const result = await pool.query(query, values);
    
    return result.rows[0]; // Return the newly created record
  } catch (error) {
    console.error('❌ Error creating appointment:', error);
    throw error;
  }
};