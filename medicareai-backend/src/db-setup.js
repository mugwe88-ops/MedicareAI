import pkg from "pg";
import pool from "../db.js";

export async function initDB() {
  try {
    await pool.query("SELECT 1");
    console.log("PostgreSQL connected");
  } catch (err) {
    console.error("DB init failed:", err);
  }
}
async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'patient',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log("Database initialized");
  } catch (err) {
    console.error("Database initialization failed:", err);
  }
}
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("localhost")
    ? false
    : { rejectUnauthorized: false },
});

export async function setupDatabase() {
  try {
    console.log("🔧 Setting up database tables...");

    // USERS TABLE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        phone TEXT,
        role TEXT DEFAULT 'patient',
        kmpdc_number TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // SESSIONS TABLE (if using express-session + connect-pg-simple)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS session (
        sid VARCHAR PRIMARY KEY,
        sess JSON NOT NULL,
        expire TIMESTAMP NOT NULL
      );
    `);

    console.log("✅ Database Tables & Sessions Initialized");
  } catch (err) {
    console.error("❌ DB setup error:", err);
  }
}

export default pool;
