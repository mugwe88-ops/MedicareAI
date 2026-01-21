import cron from 'node-cron';
import { prisma } from '../lib/prisma.js';
import axios from 'axios';

// Runs every hour
cron.schedule('0 * * * *', async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const upcoming = await prisma.appointment.findMany({
    where: {
      startTime: {
        gte: new Date(tomorrow.setHours(0,0,0,0)),
        lte: new Date(tomorrow.setHours(23,59,59,999))
      },
      reminderSent: false
    },
    include: { patient: true, doctor: true }
  });

  for (const appt of upcoming) {
    try {
      // Example using WhatsApp Business API / Twilio
      await axios.post(process.env.WHATSAPP_API_URL, {
        to: appt.patient.phoneNumber,
        message: `Hi ${appt.patient.name}, reminder of your appointment with Dr. ${appt.doctor.name} tomorrow at ${appt.startTime.toLocaleTimeString()}. Reply YES to confirm.`
      }, { headers: { Authorization: `Bearer ${process.env.WA_TOKEN}` }});

      await prisma.appointment.update({
        where: { id: appt.id },
        data: { reminderSent: true }
      });
    } catch (e) {
      console.error(`Reminder failed for ${appt.id}`);
    }
  }
});
router.get('/doctor/next-patient', async (req, res) => {
  const next = await prisma.appointment.findFirst({
    where: { 
      doctorId: req.user.id,
      startTime: { gte: new Date() },
      status: 'CONFIRMED'
    },
    include: { 
      patient: { 
        select: { name: true, medicalHistorySummary: true, lastVisitDate: true } 
      } 
    },
    orderBy: { startTime: 'asc' }
  });
  
  res.json(next);
});