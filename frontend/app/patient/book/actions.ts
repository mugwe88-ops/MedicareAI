'use server';

import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';

export async function createPatientBookingAction(formData: {
  doctorId: string;
  patientId: string;
  patientName: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  consultationType: 'Telehealth' | 'Physical';
}) {
  const { data, error } = await supabase.rpc('book_appointment_atomic', {
    p_doctor_id: formData.doctorId,
    p_patient_id: formData.patientId,
    p_patient_name: formData.patientName,
    p_appointment_date: formData.appointmentDate,
    p_start_time: formData.startTime,
    p_end_time: formData.endTime,
    p_consultation_type: formData.consultationType,
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