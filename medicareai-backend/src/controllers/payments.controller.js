import pool from '../db.js';
import * as mpesaService from '../services/mpesa.service.js';
import { sendMessage } from '../services/whatsappService.js';

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
    res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });

    // 2. Filter failures
    if (!stkCallback || stkCallback.ResultCode !== 0) {
      console.log('❌ M-Pesa transaction failed or cancelled by user');
      return;
    }

    const items = stkCallback.CallbackMetadata.Item;
    const receipt = items.find(i => i.Name === 'MpesaReceiptNumber')?.Value;
    const amount = items.find(i => i.Name === 'Amount')?.Value;
    const phone = items.find(i => i.Name === 'PhoneNumber')?.Value;
    const checkoutID = stkCallback.CheckoutRequestID;

    if (!receipt) return;

    // 3. PURE SQL: Idempotency & Booking Update
    // We use a TRANSACTION to ensure both the payment is logged AND the slot is locked
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Check if already processed
      const checkRes = await client.query('SELECT id FROM appointments WHERE mpesa_receipt = $1', [receipt]);
      if (checkRes.rowCount > 0) {
        console.log(`⚠️ Duplicate callback ignored: ${receipt}`);
        client.release();
        return;
      }

      // 4. Update the Appointment and the Availability Slot
      // We look for the appointment that matches this CheckoutRequestID
      const updateAppt = await client.query(`
        UPDATE appointments 
        SET payment_status = 'COMPLETED', mpesa_receipt = $1 
        WHERE checkout_request_id = $2 
        RETURNING slot_id, patient_phone
      `, [receipt, checkoutID]);

      if (updateAppt.rowCount > 0) {
        const slotId = updateAppt.rows[0].slot_id;
        const patientPhone = updateAppt.rows[0].patient_phone;

        // Mark the doctor's slot as officially booked
        await client.query('UPDATE availability SET is_booked = TRUE WHERE id = $1', [slotId]);

        await client.query('COMMIT');
        console.log(`✅ Appointment Confirmed! Receipt: ${receipt}`);

        // 5. Send Receipt to WhatsApp immediately
        const successMsg = `✅ *Booking Confirmed!*\n\nReceipt: ${receipt}\nAmount: KES ${amount}\n\nYour appointment is officially scheduled. The doctor has been notified.`;
        await sendMessage(patientPhone, successMsg);
      } else {
        await client.query('ROLLBACK');
        console.log("⚠️ Payment received but no matching appointment found in DB.");
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
