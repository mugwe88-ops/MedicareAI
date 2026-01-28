import pool from '../db.js';

export const markAsDone = async (appointmentId) => {
  // Mark appointment as COMPLETED
  await pool.query('UPDATE appointments SET status = "COMPLETED" WHERE id = $1', [appointmentId]);
  
  // Free up the slot for future bookings (optional, depends on your business rule)
  // await pool.query('UPDATE availability SET is_booked = FALSE WHERE id = (SELECT slot_id FROM appointments WHERE id = $1)', [appointmentId]);
};

export const markAsNoShow = async (appointmentId) => {
  await pool.query('UPDATE appointments SET status = "NO_SHOW" WHERE id = $1', [appointmentId]);
};
