export const initDb = async () => {
  const query = `
    -- 1. Doctors Table
    CREATE TABLE IF NOT EXISTS doctors (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        specialty TEXT,
        consultation_fee DECIMAL DEFAULT 0.00
    );

    -- 2. Availability Table (Doctor's Schedule)
    CREATE TABLE IF NOT EXISTS availability (
        id SERIAL PRIMARY KEY,
        doctor_id INTEGER REFERENCES doctors(id),
        available_date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        is_booked BOOLEAN DEFAULT FALSE
    );

    -- 3. Sessions Table (Memory)
    CREATE TABLE IF NOT EXISTS sessions (
        phone_number TEXT PRIMARY KEY,
        current_step TEXT DEFAULT 'START',
        metadata JSONB DEFAULT '{}',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- 4. Message Logs
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
    console.log('✅ [DB] All tables initialized.');
  } catch (err) {
    console.error('❌ [DB] Init Error:', err.message);
  }
};
