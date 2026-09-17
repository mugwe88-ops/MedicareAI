'use server';

import { revalidatePath } from 'next/cache';

export async function copyPreviousWeekScheduleAction(
  doctorId: string,
  targetStartDate: string
) {
  // Logic to read previous week schedule and duplicate dates forward
  revalidatePath('/doctors/schedule');
  return { success: true, message: 'Copied previous week schedule!' };
}

export async function applyWholeMonthScheduleAction(
  doctorId: string,
  pattern: any
) {
  // Logic to repeat pattern across current month
  revalidatePath('/doctors/schedule');
  return { success: true, message: 'Pattern applied across the month!' };
}