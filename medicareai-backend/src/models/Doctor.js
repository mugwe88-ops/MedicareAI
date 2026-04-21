import pool from "../utils/db.js";

/**
 * Get all doctors
 * Maps database columns (name, years_experience) to frontend expectations (full_name)
 */
export async function getAllDoctors() {
  const result = await pool.query(`
    SELECT 
      id, 
      name AS full_name,           -- Map 'name' to 'full_name'
      specialization, 
      bio, 
      years_experience,            -- Match exact DB column name
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
      name AS full_name, 
      specialization, 
      bio, 
      years_experience, 
      clinic_name, 
      city, 
      consultation_fee, 
      rating, 
      license_number 
    FROM doctors WHERE id = $1`,
    [id]
  );

  return result.rows[0];
}

/**
 * Create doctor
 * Includes license_number to satisfy NOT NULL constraint
 */
export async function createDoctor(data) {
  const {
    name,
    specialization,
    bio,
    years_experience,
    clinic_name,
    city,
    consultation_fee,
    license_number, // Must be provided per DB constraint
  } = data;

  const result = await pool.query(
    `
    INSERT INTO doctors (
      name, 
      specialization, 
      bio, 
      years_experience, 
      clinic_name, 
      city, 
      consultation_fee, 
      license_number, 
      is_active
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
    RETURNING id, name AS full_name, specialization, bio, years_experience, clinic_name, city, consultation_fee
    `,
    [
      name,
      specialization,
      bio,
      years_experience,
      clinic_name,
      city,
      consultation_fee,
      license_number,
    ]
  );

  return result.rows[0];
}