// src/db.js
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("localhost")
    ? false
    : { rejectUnauthorized: false },
});

pool.on("connect", () => {
  console.log("✅ PostgreSQL connected");
});

export default pool;
