import pkg from 'pg';
const { Pool } = pkg;

// Use your Render PostgreSQL connection string here
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Required for Render/Cloud DBs
});

export default pool;