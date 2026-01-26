import 'dotenv/config';
import express from 'express';
import cors from 'cors';

// Standard import now works because of our explicit schema output
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pkgPg from 'pg';
const { Pool } = pkgPg;

// Path to encryption.js (located in /medicareai-backend/src/encryption.js)
// If encryption.js is actually in the root of medicareai-backend, use '../encryption.js'
import { encrypt, decrypt } from './encryption.js'; 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors(), express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
app.get('/', (req, res) => {
  res.status(200).send('MedicareAI API is Live');
});

// 2. Routes
// This sets your endpoint to: https://medicare-ai.onrender.com/api/webhook
app.use('/api', webhookRoutes); 
app.use('/api/payments', paymentRoutes);

const PORT = process.env.PORT || 10000;

// 3. Start Server with 0.0.0.0 binding for Render
app.listen(PORT, '0.0.0.0', () => {
  console.log(`---`);
  console.log(`🟢 MedicareAI Server is Live!`);
  console.log(`🔄 Reconciliation Job: ACTIVE`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🔗 Webhook Path: /api/webhook`);
  console.log(`---`);
});