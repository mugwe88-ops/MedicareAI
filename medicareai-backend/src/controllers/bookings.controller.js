import pool from '../db.js';


/**
 * Get all bookings
 */
export async function getAllBookings(req, res) {
  try {
    // Joining with Doctors and Patients to get meaningful names
    const query = `
      SELECT b.*, d.name as doctor_name, p.name as patient_name 
      FROM "Booking" b
      LEFT JOIN "Doctor" d ON b."doctorId" = d.id
      LEFT JOIN "Patient" p ON b."patientId" = p.id
      ORDER BY b."bookingDate" DESC
    `;
    const result = await pool.query(query);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return res.status(500).json({ error: 'Failed to fetch bookings' });
  }
}

/**
 * Create a new booking
 */
export async function createBooking(req, res) {
  const { patientId, doctorId, bookingDate, status } = req.body;
  try {
    const query = `
      INSERT INTO "Booking" ("patientId", "doctorId", "bookingDate", status, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING *
    `;
    const values = [patientId, doctorId, bookingDate, status || 'PENDING'];
    const result = await pool.query(query, values);
    
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating booking:', error);
    return res.status(500).json({ error: 'Failed to create booking' });
  }
}

/**
 * Update booking status
 */
export async function updateBookingStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const query = `
      UPDATE "Booking" 
      SET status = $1, "updatedAt" = NOW() 
      WHERE id = $2 
      RETURNING *
    `;
    const result = await pool.query(query, [status, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating booking:', error);
    return res.status(500).json({ error: 'Failed to update booking' });
  }
}

/**
 * Delete a booking
 */
export async function deleteBooking(req, res) {
  const { id } = req.params;
  try {
    const query = 'DELETE FROM "Booking" WHERE id = $1';
    await pool.query(query, [id]);
    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting booking:', error);
    return res.status(500).json({ error: 'Failed to delete booking' });
  }
}