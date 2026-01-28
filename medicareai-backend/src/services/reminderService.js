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
    const reminderMsg = `🔔 *Reminder:* You have an appointment with Dr. ${appt.doctor_name} tomorrow at ${appt.start_time}. We look forward to seeing you!`;
    await sendMessage(appt.patient_phone, reminderMsg);
  }
});
