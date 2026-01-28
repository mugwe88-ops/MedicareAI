import pool from '../db.js';
import * as mpesaService from '../services/mpesa.service.js';
import { sendMessage } from '../services/whatsappService.js';

/**
 * Handle STK Push initiation from the bot flow
 */
export async function handleSTKPush(req, res) {
  try {
    const { phoneNumber, amount, reference } = req.body;
    // We pass these individually to match your updated mpesa.service.js
    const response = await mpesaService.initiateSTKPush(phoneNumber, amount, reference);
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

    // 1. Acknowledge Safaricom immediately (Crucial to avoid retries)
    res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });

    if (!stkCallback || stkCallback.ResultCode !== 0) {
      console.log('❌ M-Pesa transaction failed or cancelled.');
      return;
    }

    const items = stkCallback.CallbackMetadata.Item;
    const receipt = items.find(i => i.Name === 'MpesaReceiptNumber')?.Value;
    const amount = items.find(i => i.Name === 'Amount')?.Value;
    const phone = items.find(i => i.Name === 'PhoneNumber')?.Value;
    const checkoutID = stkCallback.CheckoutRequestID;

    if (!receipt) return;

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // 2. Idempotency Check
      const checkRes = await client.query('SELECT id FROM appointments WHERE mpesa_receipt = $1', [receipt]);
      if (checkRes.rowCount > 0) {
        client.release();
        return;
      }

      // 3. Link Payment to Appointment & Lock Slot
      const updateAppt = await client.query(`
        UPDATE appointments 
        SET payment_status = 'COMPLETED', mpesa_receipt = $1 
        WHERE checkout_request_id = $2 
        RETURNING slot_id, patient_phone
      `, [receipt, checkoutID]);

      if (updateAppt.rowCount > 0) {
        const { slot_id, patient_phone } = updateAppt.rows[0];

        // Mark doctor slot as unavailable
        await client.query('UPDATE availability SET is_booked = TRUE WHERE id = $1', [slot_id]);

        await client.query('COMMIT');
        
        // 4. Professional Receipt Generation
        const receiptMsg = 
`🏥 *MEDICARE AI - PAYMENT RECEIPT*
----------------------------------
*Status:* ✅ CONFIRMED
*Receipt:* ${receipt}
*Amount:* KES ${amount}
*Phone:* ${phone}

Your appointment is now officially scheduled. Please arrive 15 minutes early.
----------------------------------`;

        await sendMessage(patient_phone, receiptMsg);
        console.log(`✅ Success: ${receipt} processed.`);
      } else {
        await client.query('ROLLBACK');
        console.log("⚠️ CheckoutID not found in appointments table.");
      }
    } catch (dbErr) {
      await client.query('ROLLBACK');
      throw dbErr;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('M-Pesa callback error:', error);
  }
}
