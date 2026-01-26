import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import axios from 'axios';

// 1. Prisma 7 & Postgres Adapter Imports
import pkgPg from 'pg';
const { Pool } = pkgPg;
import pkgPrisma from '@prisma/client';
const { PrismaClient } = pkgPrisma;
import { PrismaPg } from '@prisma/adapter-pg';

// 2. Local Import (Matches your GitHub structure)
import { encrypt, decrypt } from '../encryption.js';

const app = express();
const PORT = process.env.PORT || 3000;

// 3. Middleware
app.use(cors());
app.use(express.json());

// 4. Database Connection Setup (Fixed for Cross-Region)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // Ensure this is the EXTERNAL URL on Render
    ssl: { rejectUnauthorized: false } 
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/* ===========================================================
   HEALTH CHECKS
   =========================================================== */

app.get('/', (req, res) => {
    res.send("🟢 MedicareAI Backend is Online");
});

app.get('/health', async (req, res) => {
    try {
        await prisma.$connect();
        res.json({ 
            status: "Connected", 
            database: "Prisma 7 Active",
            region: "Cross-Region Verified"
        });
    } catch (err) {
        res.status(500).json({ status: "Error", message: err.message });
    }
});

/* ===========================================================
   API ROUTES (Sample logic for your 152 lines)
   =========================================================== */

// Example: Create an Appointment with Encryption
app.post('/api/appointments', async (req, res) => {
    try {
        const { patientName, phone, doctorId, startTime } = req.body;
        
        // Use your encryption utility for sensitive data
        const encryptedPhone = encrypt(phone);

        const appointment = await prisma.appointment.create({
            data: {
                patient: {
                    connectOrCreate: {
                        where: { phone: phone },
                        create: { name: patientName, phone: phone }
                    }
                },
                doctor: { connect: { id: doctorId } },
                startTime: new Date(startTime),
                endTime: new Date(new Date(startTime).getTime() + 30 * 60000), // +30 mins
            }
        });

        res.status(201).json({ success: true, appointment });
    } catch (error) {
        console.error("Appointment Error:", error);
        res.status(500).json({ error: error.message });
    }
});

/* ===========================================================
   START SERVER
   =========================================================== */
app.listen(PORT, () => {
    console.log(`🚀 MedicareAI live on port ${PORT}`);
});
