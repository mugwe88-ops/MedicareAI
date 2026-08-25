import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Connection string from environment variables
const connectionString = process.env.DATABASE_URL;

// Initialize PostgreSQL Pool
export const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    // Required for Neon / Render PostgreSQL connections
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 10000, // 10-second timeout
});

// --- CONNECTION HEALTH CHECK ---
(async () => {
  let client;
  try {
    client = await pool.connect();
    console.log('✅ DATABASE HANDSHAKE SUCCESSFUL');

    // Check if the appointments table exists in the public schema
    const checkQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name = 'appointments'
      );
    `;
    const res = await client.query(checkQuery);
    const exists = res.rows[0].exists;

    console.log(
      exists
        ? '🚀 TABLE "appointments" IS LIVE AND VISIBLE'
        : '⚠️ TABLE "appointments" NOT FOUND. Run CREATE TABLE in Neon SQL editor.'
    );
  } catch (err) {
    console.error('❌ DB CONNECTION ERROR:', err.message);
  } finally {
    if (client) {
      client.release();
    }
  }
})();

// Default export for default import compatibility
export default pool;