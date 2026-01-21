import { Router } from 'express';
const router = Router();
import { prisma } from '../lib/prisma.js';
import { handleSTKPush, handleMpesaCallback } from '../controllers/payments.controller.js';
import axios from 'axios';
// Route: POST /api/payments/stkpush
router.post('/stkpush', handleSTKPush);

// Route: POST /api/payments/callback
router.post('/callback', handleMpesaCallback);

// GET /api/payments/status/:checkoutRequestId
router.get('/status/:id', async (req, res) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { checkoutRequestId: req.params.id }
    });

    if (!payment) return res.status(404).json({ error: "Transaction not found" });

    res.json({ 
      status: payment.status, // e.g., 'PENDING', 'COMPLETED', or 'FAILED'
      receipt: payment.receiptNumber || null 
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
const checkPaymentStatus = (checkoutId) => {
  const interval = setInterval(async () => {
    try {
      const response = await axios.get(`/api/payments/status/${checkoutId}`);
      
      if (response.data.status === 'COMPLETED') {
        clearInterval(interval);
        alert("Success! Your appointment is confirmed.");
        window.location.href = "/dashboard";
      } else if (response.data.status === 'FAILED') {
        clearInterval(interval);
        alert("Payment failed. Please try again.");
      }
    } catch (err) {
      console.error("Polling error:", err);
    }
  }, 3000); // Poll every 3 seconds

  // Stop polling after 60 seconds (Timeout)
  setTimeout(() => clearInterval(interval), 60000);
};
export default router;