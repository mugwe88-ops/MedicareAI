import { prisma } from '../lib/prisma.js';
import * as mpesaService from '../services/mpesa.service.js';

/**
 * Handle STK Push initiation
 */
export async function handleSTKPush(req, res) {
  try {
    const response = await mpesaService.initiateSTKPush(req.body);
    return res.status(200).json(response);
  } catch (error) {
    console.error('STK Push error:', error);
    return res.status(500).json({ error: 'Failed to initiate STK Push' });
  }
}

/**
 * Handle Safaricom M-Pesa callback
 */
export async function handleMpesaCallback(req, res) {
  try {
    const stkCallback = req.body?.Body?.stkCallback;

    // 1. Always acknowledge Safaricom immediately
    res.status(200).json({
      ResultCode: 0,
      ResultDesc: 'Accepted',
    });

    // 2. If transaction failed, exit early
    if (!stkCallback || stkCallback.ResultCode !== 0) {
      console.log('❌ M-Pesa transaction failed');
      return;
    }

    const items = stkCallback.CallbackMetadata.Item;

    const receipt = items.find(i => i.Name === 'MpesaReceiptNumber')?.Value;
    const amount = items.find(i => i.Name === 'Amount')?.Value;
    const phone = items.find(i => i.Name === 'PhoneNumber')?.Value;

    if (!receipt) {
      console.log('⚠️ No receipt number found');
      return;
    }

    // 3. Idempotency check
    const existing = await prisma.payment.findUnique({
      where: { receiptNumber: receipt },
    });

    if (existing) {
      console.log(`⚠️ Duplicate callback ignored: ${receipt}`);
      return;
    }

    // 4. Update payment record
    await prisma.payment.update({
      where: { checkoutRequestId: stkCallback.CheckoutRequestID },
      data: {
        status: 'COMPLETED',
        receiptNumber: receipt,
        amount,
        phoneNumber: phone,
      },
    });

    console.log(`✅ Payment verified: ${receipt}`);
  } catch (error) {
    console.error('M-Pesa callback error:', error);
  }
}
