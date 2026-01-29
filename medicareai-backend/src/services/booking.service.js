import pool from '../db.js';

export const getDoctors = async () => {
    const res = await pool.query('SELECT * FROM doctors WHERE is_active = true');
    return res.rows;
};

export const getAvailableSlots = async (doctorId) => {
    const res = await pool.query(
        'SELECT * FROM availability WHERE doctor_id = $1 AND is_booked = false AND available_date >= CURRENT_DATE',
        [doctorId]
    );
    return res.rows;
};

export const bookSlot = async (patientPhone, doctorId, slotId) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // 1. Mark slot as booked
        await client.query('UPDATE availability SET is_booked = true WHERE id = $1', [slotId]);
        
        // 2. Create appointment
        const res = await client.query(
            'INSERT INTO appointments (patient_phone, doctor_id, slot_id, status) VALUES ($1, $2, $3, $4) RETURNING id',
            [patientPhone, doctorId, slotId, 'CONFIRMED']
        );
        
        await client.query('COMMIT');
        return res.rows[0];
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
};
