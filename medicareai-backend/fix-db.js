require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Ensure this matches your .env key
  ssl: { rejectUnauthorized: false }
});

const updateTable = async () => {
  try {
    console.log("Connecting to database...");
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS kmpdc_number VARCHAR(255),
      ADD COLUMN IF NOT EXISTS email_otp VARCHAR(6),
      ADD COLUMN IF NOT EXISTS otp_expiry TIMESTAMP,
      ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
    `);
    console.log("✅ Success! Database columns added.");
  } catch (err) {
    console.error("❌ Error updating database:", err.message);
  } finally {
    await pool.end();
  }
};

updateTable();