import pg from 'pg';
import { addMinutes } from 'date-fns';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Required for Render/Neon
});

export const createBookingWithBuffer = async (doctorId, patientId, startTime, durationMinutes) => {
  const buffer = 10; // 10-minute buffer
  const start = new Date(startTime);
  const endTime = addMinutes(start, durationMinutes);
  const bufferedEndTime = addMinutes(endTime, buffer);

  try {
    // 1. Check for conflicts using raw SQL
    // We check if the new start time or buffered end time falls within any existing appointment
    const conflictQuery = `
      SELECT id FROM "Appointment"
      WHERE "doctorId" = $1
      AND (
        ($2 >= "startTime" AND $2 < "endTime") OR
        ($3 > "startTime" AND $3 <= "endTime") OR
        ("startTime" >= $2 AND "startTime" < $3)
      )
      LIMIT 1;
    `;

    const conflictResult = await pool.query(conflictQuery, [
      doctorId, 
      start.toISOString(), 
      bufferedEndTime.toISOString()
    ]);

    if (conflictResult.rows.length > 0) {
      throw new Error("This slot (plus required buffer) overlaps with an existing appointment.");
    }

    // 2. Create the booking if no conflict is found
    const insertQuery = `
      INSERT INTO "Appointment" 
      ("doctorId", "patientId", "startTime", "endTime", "status")
      VALUES ($1, $2, $3, $4, 'PENDING')
      RETURNING *;
    `;

    const newBooking = await pool.query(insertQuery, [
      doctorId,
      patientId,
      start.toISOString(),
      endTime.toISOString()
    ]);

    return newBooking.rows[0]; // Return the created booking

  } catch (error) {
    console.error('❌ Booking Service Error:', error.message);
    throw error;
  }
};