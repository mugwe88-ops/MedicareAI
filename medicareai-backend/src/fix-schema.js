import { pool } from "./db.js";

async function fix() {
  await pool.query(`
    ALTER TABLE appointments 
    ADD COLUMN IF NOT EXISTS doctor_id INT,
    ADD COLUMN IF NOT EXISTS patient_id INT,
    ADD COLUMN IF NOT EXISTS appointment_date TIMESTAMP,
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Scheduled';
  `);

  console.log("✅ Schema fixed");
  process.exit();
}

fix();
