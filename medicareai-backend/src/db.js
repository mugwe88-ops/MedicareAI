import pkg from 'pg';
const { Pool } = pkg;

// 1. Setup the connection pool using your existing logic
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
});

/**
 * AUTO-INITIALIZATION LOGIC
 * This creates the 'messages' table automatically if it doesn't exist.
 */
export const initDb = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        whatsapp_id TEXT UNIQUE NOT NULL,
        phone_number TEXT NOT NULL,
        message_text TEXT,
        intent TEXT,
        reply_sent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  try {
    const client = await pool.connect();
    await client.query(query);
    console.log("✅ [DB] Messages table is ready.");
    client.release();
  } catch (err) {
    console.error("❌ [DB] Initialization failed:", err.message);
  }
};

export default pool;