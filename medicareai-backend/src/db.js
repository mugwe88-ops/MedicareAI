import pkg from 'pg';
const { Pool } = pkg;
import 'dotenv/config';

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Inside your database initialization function in src/db.js
const initDb = async () => {
    try {
        // This command runs every time the server starts and fixes the table for you
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS kmpdc_number VARCHAR(100);
        `);
        console.log("✅ Database schema updated: kmpdc_number column is ready.");
    } catch (err) {
        console.error("❌ Database init error:", err);
    }
};

initDb();
// src/db.js - Auto-healing script
const ensureColumns = async () => {
    try {
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS kmpdc_number VARCHAR(100);
        `);
        console.log("✅ Database updated with kmpdc_number column");
    } catch (err) {
        console.error("❌ Column update failed:", err);
    }
};

ensureColumns();