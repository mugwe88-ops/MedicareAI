import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    // This is required for Neon & Render to communicate securely
    rejectUnauthorized: false 
  },
  // Adding connection timeout to prevent hanging 
  connectionTimeoutMillis: 5000, 
});

// Immediate connection test to identify issues on startup
pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ DATABASE CONNECTION ERROR:', err.message);
  }
  console.log('✅ SUCCESSFULLY CONNECTED TO NEON DATABASE');
  
  // Verify the schema/table existence specifically for the app user
  client.query("SELECT to_regclass('public.appointments')", (qErr, res) => {
    release();
    if (qErr) {
        console.error('❌ SCHEMA QUERY ERROR:', qErr.message);
    } else {
        const tableExists = res.rows[0].to_regclass;
        console.log(tableExists ? '🚀 TABLE "appointments" DETECTED' : '⚠️ TABLE "appointments" NOT FOUND IN PUBLIC SCHEMA');
    }
  });
});

export default pool;