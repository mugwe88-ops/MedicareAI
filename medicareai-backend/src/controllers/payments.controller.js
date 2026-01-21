import * as mpesaService from '../services/mpesa.service.js';
import { prisma } from '../lib/prisma.js'; // Assuming you use Prisma

export const handleCallback = async (req, res) => {
  const { Body: { stkCallback } } = req.body;
  
  // 1. ALWAYS acknowledge Safaricom first
  res.status(200).json({ ResultCode: 0, ResultDesc: "Accepted" });

  if (stkCallback.ResultCode === 0) {
    const meta = stkCallback.CallbackMetadata.Item;
    const receipt = meta.find(i => i.Name === 'MpesaReceiptNumber').Value;
    
    // IDEMPOTENCY: Check if this receipt was already processed
    const existing = await prisma.payment.findUnique({ where: { receiptNumber: receipt } });
    if (existing) return console.log(`⚠️ Duplicate callback ignored: ${receipt}`);

    // Update your database
    await prisma.payment.update({
      where: { checkoutRequestId: stkCallback.CheckoutRequestID },
      data: { status: 'COMPLETED', receiptNumber: receipt }
    });
    console.log(`✅ Payment Verified: ${receipt}`);
  }
};