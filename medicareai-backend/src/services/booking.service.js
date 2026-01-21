import { prisma } from '../lib/prisma.js';
import { addMinutes, isWithinInterval } from 'date-fns';

export const createBookingWithBuffer = async (doctorId, patientId, startTime, durationMinutes) => {
  const buffer = 10; // 10-minute buffer
  const endTime = addMinutes(new Date(startTime), durationMinutes);
  const bufferedEndTime = addMinutes(endTime, buffer);

  // Check for conflicts
  const conflict = await prisma.appointment.findFirst({
    where: {
      doctorId,
      OR: [
        {
          // Check if new start time falls inside an existing appointment
          startTime: { lte: startTime },
          endTime: { gte: startTime }
        },
        {
          // Check if new end time (+ buffer) overlaps a future appointment
          startTime: { lte: bufferedEndTime },
          endTime: { gte: bufferedEndTime }
        }
      ]
    }
  });

  if (conflict) throw new Error("This slot (plus required buffer) is unavailable.");

  return await prisma.appointment.create({
    data: {
      doctorId,
      patientId,
      startTime: new Date(startTime),
      endTime, // True medical time
      status: 'CONFIRMED'
    }
  });
};