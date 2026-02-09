// src/models/Doctor.js
import pool from "../db.js";

/**
 * Get all doctors
 */
export async function getAllDoctors() {
  const result = await pool.query(`
    SELECT id, full_name, specialization, bio, experience_years, clinic_name,
           city, consultation_fee, rating, is_active
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
    `SELECT * FROM doctors WHERE id = $1`,
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
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    RETURNING *
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
