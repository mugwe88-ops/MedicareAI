// src/db.js
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

// Create PostgreSQL connection pool
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  // Neon / Render requires SSL
  ssl: {
    rejectUnauthorized: false,
  },
});

// Test connection automatically when server starts
pool.connect()
  .then(() => console.log("✅ PostgreSQL connected"))
  .catch((err) => console.error("❌ PostgreSQL connection error:", err));
