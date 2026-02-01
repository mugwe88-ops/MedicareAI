import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Required for Render/Neon
});

/**
 * Updates a patient's reliability score based on their appointment outcome.
 * @param {string} patientId - The ID of the patient.
 * @param {string} outcome - 'COMPLETED', 'LATE_CANCEL', or 'NO_SHOW'.
 */
export const updateReliabilityScore = async (patientId, outcome) => {
  // 1. Define the points for each outcome
  const pointsMap = {
    'COMPLETED': 5,
    'LATE_CANCEL': -10,
    'NO_SHOW': -25
  };

  const pointsToAdd = pointsMap[outcome] || 0;

  // 2. Update the database using raw SQL
  try {
    // We use "increment" logic directly in the SET clause
    // Table and column names are double-quoted to match Prisma's case-sensitive schema
    const query = `
      UPDATE "Patient"
      SET "reliabilityScore" = "reliabilityScore" + $1
      WHERE id = $2
      RETURNING id, "reliabilityScore";
    `;

    const result = await pool.query(query, [pointsToAdd, patientId]);

    if (result.rows.length === 0) {
      throw new Error("Patient not found");
    }

    console.log(`✅ Updated reliability for Patient ${patientId}: ${pointsToAdd} points.`);
    return result.rows[0]; // Returns the updated patient record

  } catch (error) {
    console.error('❌ Error updating reliability score:', error.message);
    throw error;
  }
};