import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Use the environment variable for security, falling back to your string only if necessary
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    // REQUIRED for Neon/Render connection success
    rejectUnauthorized: false 
  },
  connectionTimeoutMillis: 10000, // 10 seconds timeout
});

// --- CONNECTION HEALTH CHECK ---
pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ DB CONNECTION ERROR:', err.message);
  }
  
  console.log('✅ DATABASE HANDSHAKE SUCCESSFUL');

  // Specific check to see if the table is visible in the public schema
  client.query(
    "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'appointments')",
    (qErr, res) => {
      release();
      if (qErr) {
        console.error('❌ TABLE CHECK FAILED:', qErr.message);
      } else {
        const exists = res.rows[0].exists;
        console.log(exists 
          ? '🚀 TABLE "appointments" IS LIVE AND VISIBLE' 
          : '⚠️ TABLE "appointments" NOT FOUND. Run CREATE TABLE in Neon SQL editor.'
        );
      }
    }
  );
});

export default pool;