import pool from '../db.js';

export const getDoctors = async () => {
    const res = await pool.query('SELECT * FROM doctors WHERE is_active = true');
    return res.rows;
};

export const getSession = async (phoneNumber) => {
    const res = await pool.query('SELECT * FROM sessions WHERE phone_number = $1', [phoneNumber]);
    return res.rows[0];
};

export const updateSession = async (phoneNumber, step, metadata = {}) => {
    const query = `
        INSERT INTO sessions (phone_number, current_step, metadata, updated_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        ON CONFLICT (phone_number) 
        DO UPDATE SET current_step = $2, metadata = $3, updated_at = CURRENT_TIMESTAMP
    `;
    await pool.query(query, [phoneNumber, step, JSON.stringify(metadata)]);
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
