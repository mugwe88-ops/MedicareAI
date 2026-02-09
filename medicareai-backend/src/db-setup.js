// src/utils/db-setup.js

import pool from "../db.js";

// Test DB connection
export async function initDB() {
  try {
    await pool.query("SELECT 1");
    console.log("✅ PostgreSQL connected");
  } catch (err) {
    console.error("❌ DB connection failed:", err);
    process.exit(1);
  }
}

// Create tables
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

    // SESSIONS TABLE (for express-session + connect-pg-simple)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS session (
        sid VARCHAR PRIMARY KEY,
        sess JSON NOT NULL,
        expire TIMESTAMP NOT NULL
      );
    `);

    console.log("✅ Database tables initialized");
  } catch (err) {
    console.error("❌ Database setup error:", err);
  }
}
