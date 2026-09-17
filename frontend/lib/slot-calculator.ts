import { DoctorAvailability, Appointment } from '@/lib/supabase';

export interface GeneratedTimeSlot {
  startTime: string; // "08:00"
  endTime: string;   // "08:30"
  isBooked: boolean;
}

export function generateAvailableSlots(
  availability: DoctorAvailability | null,
  existingAppointments: Appointment[]
): GeneratedTimeSlot[] {
  if (!availability) return [];

  // Disable past dates, Off Duty, Leave, Holiday, or Fully Booked
  if (['Off Duty', 'Leave', 'Holiday', 'Fully Booked'].includes(availability.status)) {
    return [];
  }

  const slots: GeneratedTimeSlot[] = [];
  const slotDuration = availability.slot_duration || 30;
  const bufferMinutes = availability.buffer_minutes || 15;

  // Parse Start and End Times into total minutes from midnight
  const [startHour, startMin] = availability.start_time.split(':').map(Number);
  const [endHour, endMin] = availability.end_time.split(':').map(Number);

  let currentMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  const bookedSet = new Set(
    existingAppointments
      .filter((a) => a.status === 'Scheduled')
      .map((a) => a.start_time.slice(0, 5))
  );

  while (currentMinutes + slotDuration <= endMinutes) {
    const slotStartH = Math.floor(currentMinutes / 60).toString().padStart(2, '0');
    const slotStartM = (currentMinutes % 60).toString().padStart(2, '0');
    const slotStartTimeStr = `${slotStartH}:${slotStartM}`;

    const slotEndMinutes = currentMinutes + slotDuration;
    const slotEndH = Math.floor(slotEndMinutes / 60).toString().padStart(2, '0');
    const slotEndM = (slotEndMinutes % 60).toString().padStart(2, '0');
    const slotEndTimeStr = `${slotEndH}:${slotEndM}`;

    slots.push({
      startTime: slotStartTimeStr,
      endTime: slotEndTimeStr,
      isBooked: bookedSet.has(slotStartTimeStr),
    });

    // Advance by slot duration + mandatory buffer time
    currentMinutes += slotDuration + bufferMinutes;
  }

  return slots;
}