import { Router } from 'express';
import pg from 'pg';
import { handleSTKPush, handleMpesaCallback } from '../controllers/mpesaController.js';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();
const { Pool } = pg;

// 1. Database Connection Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Required for Render/Neon databases
});

// Route: POST /api/payments/stkpush
router.post('/stkpush', handleSTKPush);

// Route: POST /api/payments/callback
router.post('/callback', handleMpesaCallback);

// Route: GET /api/payments/status/:id
// Rewritten to use raw SQL instead of prisma.payment.findUnique
router.get('/status/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // We use a parameterized query ($1) to prevent SQL Injection
    // Table name is double-quoted "Payment" to match Prisma's case-sensitive naming
    const query = 'SELECT * FROM "Payment" WHERE "checkoutRequestId" = $1';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    const payment = result.rows[0]; // Access the first record from the result rows

    res.json({
      status: payment.status, // e.g., 'PENDING', 'COMPLETED', or 'FAILED'
      receipt: payment.receiptNumber || null,
      amount: payment.amount,
      updatedAt: payment.updatedAt
    });

  } catch (error) {
    console.error('❌ Payment status check error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;