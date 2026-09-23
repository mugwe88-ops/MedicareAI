import { DoctorAvailability, Appointment } from './supabase';

export interface GeneratedTimeSlot {
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

// Convert 12h or 24h time strings to total minutes from midnight
function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const clean = timeStr.trim().toUpperCase();
  
  const isPM = clean.includes('PM');
  const isAM = clean.includes('AM');
  const timeWithoutPeriod = clean.replace(/(AM|PM)/g, '').trim();
  
  const parts = timeWithoutPeriod.split(':');
  let hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

// Format total minutes back to "08:00 AM" string
function formatMinutesTo12H(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
  
  return `${displayHours.toString().padStart(2, '0')}:${displayMinutes} ${period}`;
}

export function generateAvailableSlots(
  availability: DoctorAvailability | null | undefined,
  existingAppointments: Appointment[] = []
): GeneratedTimeSlot[] {
  if (!availability) return [];

  // Check availability status (support boolean flag or string status)
  const isAvailable =
    (availability as any).is_available !== false &&
    (availability as any).status !== 'Off' &&
    (availability as any).status !== 'Unavailable';

  if (!isAvailable) return [];

  const rawStart = (availability as any).start_time || (availability as any).startTime || '08:00 AM';
  const rawEnd = (availability as any).end_time || (availability as any).endTime || '17:00';
  const slotDuration = (availability as any).slot_duration || (availability as any).slotDuration || 30;
  const bufferTime = (availability as any).buffer_time || (availability as any).bufferTime || 15;

  const startMins = parseTimeToMinutes(rawStart);
  const endMins = parseTimeToMinutes(rawEnd);

  if (startMins >= endMins) return [];

  const slots: GeneratedTimeSlot[] = [];
  let currentStart = startMins;

  while (currentStart + slotDuration <= endMins) {
    const currentEnd = currentStart + slotDuration;
    const formattedStart = formatMinutesTo12H(currentStart);
    const formattedEnd = formatMinutesTo12H(currentEnd);

    // Check against existing booked appointments
    const isBooked = existingAppointments.some((appt) => {
      const apptStart = (appt as any).start_time || (appt as any).startTime;
      return apptStart && apptStart.trim() === formattedStart.trim();
    });

    slots.push({
      startTime: formattedStart,
      endTime: formattedEnd,
      isBooked,
    });

    currentStart += slotDuration + bufferTime;
  }

  return slots;
}