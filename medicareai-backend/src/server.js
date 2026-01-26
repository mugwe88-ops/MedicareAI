import 'dotenv/config';
import express from 'express';
import cors from 'cors';

// 1. Prisma 7 Custom Path Import
// This bypasses the node_modules error by pointing directly to the generated files
import { PrismaClient } from './generated/client/index.js';
import { PrismaPg } from '@prisma/adapter-pg';


// 2. Encryption Import (One level up from /src)
import { encrypt, decrypt } from '../encryption.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 3. Database Connection (SSL enabled for cross-region)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } 
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/* ===========================================================
   HEALTH & STATUS ROUTES
   =========================================================== */

app.get('/', (req, res) => {
    res.send("🟢 MedicareAI Backend is Online");
});

app.get('/health', async (req, res) => {
    try {
        await prisma.$connect();
        res.json({ 
            status: "Success", 
            database: "Connected via Prisma 7 Custom Path",
            time: new Date().toISOString()
        });
    } catch (err) {
        res.status(500).json({ status: "DB Error", message: err.message });
    }
});

/* ===========================================================
   CORE BUSINESS LOGIC (Appointments & Payments)
   =========================================================== */

// Create Appointment & Initiate Payment
app.post('/api/appointments', async (req, res) => {
    const { patientName, phone, doctorId, startTime } = req.body;
    
    try {
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
                endTime: new Date(new Date(startTime).getTime() + 30 * 60000), // Default 30 mins
                status: 'PENDING'
            }
        });

        // Trigger your M-Pesa logic here using 'phone' and 'appointment.id'
        res.status(201).json({ success: true, appointmentId: appointment.id });
    } catch (error) {
        console.error("Appointment creation failed:", error);
        res.status(500).json({ error: "Could not create appointment" });
    }
});

// M-Pesa Callback (Placeholder for your webhook logic)
app.post('/api/payments/callback', async (req, res) => {
    // Logic for processing M-Pesa STK Push results
    res.json({ ResultCode: 0, ResultDesc: "Accepted" });
});

/* ===========================================================
   START SERVER
   =========================================================== */
app.listen(PORT, () => {
    console.log(`🚀 MedicareAI live on port ${PORT}`);
    console.log(`📡 Database linked via Prisma 7 Adapter`);
});