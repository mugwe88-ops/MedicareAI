import { Router } from 'express';
import pool from '../utils/db.js'; // Import your existing pool instead of creating a new one
import { handleSTKPush, handleMpesaCallback } from '../controllers/payments.controller.js'; 
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

// Route: POST /api/payments/stkpush
router.post('/stkpush', handleSTKPush);

// Route: POST /api/payments/callback
router.post('/callback', handleMpesaCallback);

// Route: GET /api/payments/status/:id
router.get('/status/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Table name matches Prisma's case-sensitive naming "Payment"
        const query = 'SELECT * FROM "Payment" WHERE "checkoutRequestId" = $1';
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Transaction not found" });
        }

        const payment = result.rows[0];

        res.json({
            status: payment.status,
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