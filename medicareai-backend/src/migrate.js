import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    console.log("🛠️ Starting migration...");
    
    // Add all missing columns to the users table
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS kmpdc_number VARCHAR(255),
      ADD COLUMN IF NOT EXISTS email_otp VARCHAR(6),
      ADD COLUMN IF NOT EXISTS otp_expiry TIMESTAMP,
      ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
    `);

    console.log("✅ Database updated successfully! All columns are present.");
    process.exit(0);
  } catch (e) {
    console.error("❌ Migration ERROR:", e.message);
    process.exit(1);
  }
}

run();
