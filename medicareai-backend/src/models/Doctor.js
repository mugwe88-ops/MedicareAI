import pool from "../utils/db.js";

/**
 * Get all active doctors
 * Aliasing columns ensures the frontend receives data in the expected format.
 * Ordered by rating to show top-tier providers first.
 */
export async function getAllDoctors() {
  try {
    const result = await pool.query(`
      SELECT 
        id, 
        name AS full_name,           -- Map 'name' to 'full_name'
        specialization AS specialty, -- Map 'specialization' to 'specialty'
        bio, 
        years_experience,            -- Matches DB column
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
  } catch (err) {
    console.error("Database Error in getAllDoctors:", err.message);
    throw err;
  }
}

/**
 * Get a specific doctor by ID
 * Includes license_number for detailed views or administrative verification.
 */
export async function getDoctorById(id) {
  try {
    const result = await pool.query(
      `SELECT 
        id, 
        name AS full_name, 
        specialization AS specialty, 
        bio, 
        years_experience, 
        clinic_name, 
        city, 
        consultation_fee, 
        rating, 
        license_number 
      FROM doctors 
      WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  } catch (err) {
    console.error(`Database Error in getDoctorById (${id}):`, err.message);
    throw err;
  }
}

/**
 * Create a new doctor record
 * Automatically sets is_active to true and aliases the returning data.
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
    license_number,
  } = data;

  try {
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
      RETURNING 
        id, 
        name AS full_name, 
        specialization AS specialty, 
        bio, 
        years_experience, 
        clinic_name, 
        city, 
        consultation_fee
      `,
      [
        name, 
        specialization, 
        bio, 
        years_experience, 
        clinic_name, 
        city, 
        consultation_fee, 
        license_number
      ]
    );
    return result.rows[0];
  } catch (err) {
    console.error("Database Error in createDoctor:", err.message);
    throw err;
  }
}