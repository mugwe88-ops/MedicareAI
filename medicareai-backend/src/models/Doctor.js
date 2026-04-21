import pool from "../utils/db.js";

/**
 * Get all doctors
 * Aliasing columns to match frontend expectations (name and specialty)
 */
export async function getAllDoctors() {
  const result = await pool.query(`
    SELECT 
      id, 
      full_name AS name,           -- Aliased for frontend
      specialization AS specialty, -- Aliased for frontend
      bio, 
      experience_years, 
      clinic_name,
      city, 
      consultation_fee, 
      rating, 
      is_active
    FROM doctors
    WHERE is_active = true
    ORDER BY rating DESC
  `);

  return result.rows;
}

/**
 * Get doctor by ID
 */
export async function getDoctorById(id) {
  const result = await pool.query(
    `SELECT 
      id, 
      full_name AS name, 
      specialization AS specialty, 
      * FROM doctors WHERE id = $1`,
    [id]
  );

  return result.rows[0];
}

/**
 * Create doctor (admin later)
 */
export async function createDoctor(data) {
  const {
    full_name,
    specialization,
    bio,
    experience_years,
    clinic_name,
    city,
    consultation_fee,
  } = data;

  const result = await pool.query(
    `
    INSERT INTO doctors (full_name, specialization, bio, experience_years, clinic_name, city, consultation_fee)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, full_name AS name, specialization AS specialty, bio, experience_years, clinic_name, city, consultation_fee
    `,
    [
      full_name,
      specialization,
      bio,
      experience_years,
      clinic_name,
      city,
      consultation_fee,
    ]
  );

  return result.rows[0];
}