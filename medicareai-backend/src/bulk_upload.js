import { pool } from './db.js';

const doctorData = [
    ['A1111', 'Dr. Alice One'],
    ['A2222', 'Dr. Bob Two'],
    ['B3333', 'Dr. Charlie Three'],
    // ... Paste your 100+ numbers here
];

async function upload() {
    try {
        console.log("🚀 Starting bulk upload...");
        // This efficiently inserts multiple rows in one command
        const query = `
            INSERT INTO verified_kmpdc (registration_number, doctor_name)
            VALUES ${doctorData.map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`).join(',')}
            ON CONFLICT (registration_number) DO NOTHING;
        `;
        
        await pool.query(query, doctorData.flat());
        console.log(`✅ Successfully synced ${doctorData.length} doctors.`);
        process.exit(0);
    } catch (err) {
        console.error("❌ Upload failed:", err.message);
        process.exit(1);
    }
}

upload();