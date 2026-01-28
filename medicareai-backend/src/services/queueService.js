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

export const getDoctorQueue = async (doctorId) => {
  const query = `
    SELECT 
      a.id AS appointment_id,
      a.patient_phone,
      v.start_time,
      a.payment_status,
      a.status AS queue_status
    FROM appointments a
    JOIN availability v ON a.slot_id = v.id
    WHERE a.doctor_id = $1 
    AND v.available_date = CURRENT_DATE
    AND a.payment_status = 'COMPLETED'
    AND a.status = 'PENDING' -- Only show patients not yet seen
    ORDER BY v.start_time ASC;
  `;
  const res = await pool.query(query, [doctorId]);
  return res.rows;
};
