import pool from '../db.js';
import { sendMessage } from './whatsappService.js';
import cron from 'node-cron';

// This runs every hour at the 00 minute
cron.schedule('0 * * * *', async () => {
  console.log('⏰ Checking for upcoming appointments...');
  
  const upcoming = await pool.query(`
    SELECT a.patient_phone, d.name as doctor_name, v.start_time 
    FROM appointments a
    JOIN doctors d ON a.doctor_id = d.id
    JOIN availability v ON a.slot_id = v.id
    WHERE v.available_date = CURRENT_DATE + INTERVAL '1 day' -- Remind 24 hours before
    AND a.payment_status = 'COMPLETED'
  `);

  for (let appt of upcoming.rows) {
    // Inside your reminder loop in src/services/reminderService.js

const reminderMsg = 
`🔔 *APPOINTMENT REMINDER*
----------------------------------
Hello! This is a friendly reminder of your upcoming medical consultation.

📅 *When:* Tomorrow, ${new Date(appt.available_date).toLocaleDateString('en-GB')}
⏰ *Time:* ${appt.start_time}
👨‍⚕️ *Doctor:* Dr. ${appt.doctor_name}
📍 *Location:* [Insert Clinic Name/Link]

*Please Remember:*
• Arrive 15 minutes early for registration.
• Carry your previous medical reports (if any).
• Show your M-Pesa receipt: *${appt.mpesa_receipt}*

Need to reschedule? Please contact us at [Insert Support Number].
----------------------------------
_MedicareAI: Your health, our priority._`;
    // Run every hour to catch appointments exactly 24 hours away
cron.schedule('0 * * * *', async () => {
    const tomorrow = await pool.query(`
        SELECT a.*, d.name as doctor_name, v.start_time, v.available_date 
        FROM appointments a
        JOIN doctors d ON a.doctor_id = d.id
        JOIN availability v ON a.slot_id = v.id
        WHERE v.available_date = CURRENT_DATE + INTERVAL '1 day'
        AND a.payment_status = 'COMPLETED'
        AND a.reminder_sent = FALSE -- We should add this column!
    `);
    // ... loop and send ...
});

await sendMessage(appt.patient_phone, reminderMsg);
  }
});
