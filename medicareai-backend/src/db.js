import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export const initDb = async () => {
  const query = `
    -- 1. Doctors Table
    CREATE TABLE IF NOT EXISTS doctors (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        specialty TEXT,
        phone_number TEXT UNIQUE,
        email TEXT UNIQUE,
        password_hash TEXT,
        consultation_fee DECIMAL DEFAULT 0.00,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. Availability Table
    CREATE TABLE IF NOT EXISTS availability (
        id SERIAL PRIMARY KEY,
        doctor_id INTEGER REFERENCES doctors(id),
        available_date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        is_booked BOOLEAN DEFAULT FALSE
    );

    -- 3. Sessions Table
    CREATE TABLE IF NOT EXISTS sessions (
        phone_number TEXT PRIMARY KEY,
        current_step TEXT DEFAULT 'START',
        metadata JSONB DEFAULT '{}',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- 4. Appointments Table
    CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        patient_phone TEXT NOT NULL,
        doctor_id INTEGER REFERENCES doctors(id),
        slot_id INTEGER REFERENCES availability(id),
        checkout_request_id TEXT UNIQUE,
        payment_status TEXT DEFAULT 'PENDING',
        status TEXT DEFAULT 'PENDING',
        mpesa_receipt TEXT UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- 5. Message Logs
    CREATE TABLE IF NOT EXISTS message_logs (
        id SERIAL PRIMARY KEY,
        wamid TEXT UNIQUE,
        phone_number TEXT,
        message_text TEXT,
        intent TEXT,
        reply_text TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(query);
    console.log('✅ [DB] Swift MD Tables initialized.');

    // --- AUTO-SEEDING ---
    const doctorCheck = await pool.query('SELECT id FROM doctors LIMIT 1');
    if (doctorCheck.rowCount === 0) {
      console.log('🌱 [DB] No doctors found. Planting test data...');
      const drResult = await pool.query(`
        INSERT INTO doctors (name, specialty, consultation_fee) 
        VALUES ('Dr. M. Smith', 'Cardiologist', 2500), ('Dr. Sarah Jane', 'Pediatrician', 1500)
        RETURNING id
      `);
      const dr1Id = drResult.rows[0].id;
      const dr2Id = drResult.rows[1].id;

      await pool.query(`
        INSERT INTO availability (doctor_id, available_date, start_time, end_time) 
        VALUES 
        (${dr1Id}, '2026-03-01', '09:00', '10:00'),
        (${dr2Id}, '2026-03-02', '14:00', '15:00')
      `);
      console.log('✅ [DB] Test data planted.');
    }
  } catch (err) {
    console.error('❌ [DB] Init Error:', err.message);
  }
};

export default pool;
