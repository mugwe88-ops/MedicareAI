import pkg from 'pg';
const { Pool } = pkg;
import 'dotenv/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("localhost")
    ? false
    : { rejectUnauthorized: false },
});

// Log connection
pool.on("connect", () => {
  console.log("✅ PostgreSQL Connected");
});

// Auto-healing migration (runs once at startup)
async function autoMigrate() {
  try {
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS kmpdc_number VARCHAR(100);
    `);
    console.log("✅ Database schema ensured (kmpdc_number ready)");
  } catch (err) {
    console.error("❌ Auto migration error:", err.message);
  }
}

await pool.query(`
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'patient';
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;
`);

autoMigrate();

// ✅ IMPORTANT: DEFAULT EXPORT
export default pool;
