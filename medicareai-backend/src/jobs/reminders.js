import cron from 'node-cron';
import pg from 'pg';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Runs every hour
cron.schedule('0 * * * *', async () => {
  console.log('⏰ Running Appointment Reminders...');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const startOfTomorrow = new Date(tomorrow.setHours(0, 0, 0, 0)).toISOString();
  const endOfTomorrow = new Date(tomorrow.setHours(23, 59, 59, 999)).toISOString();

  try {
    // 1. Fetch upcoming appointments (replaces prisma.appointment.findMany)
    // We use a JOIN to get patient and doctor details in one query
    const query = `
      SELECT a.*, p.phone_number, p.name as patient_name
      FROM "Appointment" a
      JOIN "Patient" p ON a.patient_id = p.id
      WHERE a.start_time >= $1 
        AND a.start_time <= $2 
        AND a.reminder_sent = false
    `;
    
    const result = await pool.query(query, [startOfTomorrow, endOfTomorrow]);
    const upcoming = result.rows;

    for (const appt of upcoming) {
      try {
        // 2. Send WhatsApp Notification
        await axios.post(process.env.WHATSAPP_API_URL, {
          to: appt.phone_number,
          message: `Hi ${appt.patient_name}, reminder of your appointment tomorrow at ${new Date(appt.start_time).toLocaleTimeString()}.`
        }, {
          headers: { Authorization: `Bearer ${process.env.WA_TOKEN}` }
        });

        // 3. Mark reminder as sent (replaces prisma.appointment.update)
        await pool.query(
          'UPDATE "Appointment" SET reminder_sent = true WHERE id = $1',
          [appt.id]
        );

        console.log(`✅ Reminder sent to ${appt.patient_name}`);
      } catch (err) {
        console.error(`❌ Failed to send reminder for ID ${appt.id}:`, err.message);
      }
    }
  } catch (error) {
    console.error('❌ Database error in reminders job:', error);
  }
});