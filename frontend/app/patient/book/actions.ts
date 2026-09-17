'use server';

import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';

// Define the interface to match all parameters sent by page.tsx
export interface BookingPayload {
  doctorId: string;
  patientId: string;
  patientName: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  consultationType: 'Telehealth' | 'Physical';
  bodySystem?: string;
  symptoms?: string[];
  painLevel?: number;
  reason?: string;
  refCode?: string;
}

export async function createPatientBookingAction(formData: BookingPayload) {
  const { data, error } = await supabase.rpc('book_appointment_atomic', {
    p_doctor_id: formData.doctorId,
    p_patient_id: formData.patientId,
    p_patient_name: formData.patientName,
    p_appointment_date: formData.appointmentDate,
    p_start_time: formData.startTime,
    p_end_time: formData.endTime,
    p_consultation_type: formData.consultationType,
    // Add additional parameters here if your Supabase RPC function accepts them
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (!data.success) {
    return { success: false, error: data.error };
  }

  revalidatePath('/doctors/schedule');
  revalidatePath('/patients/book');

  return { success: true, appointmentId: data.appointment_id };
}