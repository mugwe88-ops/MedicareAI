import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Use the External Connection String from Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, 
  ssl: { rejectUnauthorized: false }
});

const fixDatabase = async () => {
  try {
    console.log("🛠️  Starting migration...");
    
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS kmpdc_number VARCHAR(255),
      ADD COLUMN IF NOT EXISTS email_otp VARCHAR(6),
      ADD COLUMN IF NOT EXISTS otp_expiry TIMESTAMP,
      ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
    `);

    console.log("✅ Database updated successfully! Columns are now present.");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
  } finally {
    await pool.end();
    process.exit();
  }
};

fixDatabase();