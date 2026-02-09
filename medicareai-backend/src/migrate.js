import { pool } from "./db.js";

const migrate = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        phone VARCHAR(20),
        email VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS doctors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        specialty VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        patient_id INT REFERENCES patients(id),
        doctor_id INT REFERENCES doctors(id),
        appointment_date TIMESTAMP,
        status VARCHAR(20) DEFAULT 'Scheduled',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log("✅ Database tables created");
    process.exit();
  } catch (err) {
    console.error("❌ Migration failed", err);
    process.exit(1);
  }
};

migrate();
