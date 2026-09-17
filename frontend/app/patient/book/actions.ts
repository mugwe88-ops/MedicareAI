'use server';

import { revalidatePath } from 'next/cache';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

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
  try {
    // 1. Initialize Server Supabase Client with cookies for Auth
    const supabase = createServerActionClient({ cookies });

    // 2. Validate current session user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    // Fallback to provided patientId if auth session isn't strict, but prefer user.id
    const activePatientId = user?.id || formData.patientId;

    if (!activePatientId) {
      return { success: false, error: 'User session not found. Please log in again.' };
    }

    // 3. Attempt Atomic RPC Booking First
    const { data: rpcData, error: rpcError } = await supabase.rpc('book_appointment_atomic', {
      p_doctor_id: formData.doctorId,
      p_patient_id: activePatientId,
      p_patient_name: formData.patientName,
      p_appointment_date: formData.appointmentDate,
      p_start_time: formData.startTime,
      p_end_time: formData.endTime,
      p_consultation_type: formData.consultationType,
      p_body_system: formData.bodySystem || 'General',
      p_symptoms: formData.symptoms || [],
      p_pain_level: formData.painLevel || 0,
      p_reason: formData.reason || '',
      p_ref_code: formData.refCode || '',
    });

    // If RPC succeeded, handle response
    if (!rpcError && rpcData) {
      if (rpcData.success === false) {
        return { success: false, error: rpcData.error || 'Failed to reserve appointment slot.' };
      }

      revalidatePath('/patient/dashboard/appointments/book');
      revalidatePath('/patient/dashboard');
      return { success: true, appointmentId: rpcData.appointment_id || rpcData.id };
    }

    // 4. Fallback Direct Table Insert (If RPC function is missing or disabled in DB)
    console.warn('RPC failed or not found, falling back to direct table insert:', rpcError?.message);

    const { data: insertData, error: insertError } = await supabase
      .from('appointments')
      .insert([
        {
          doctor_id: formData.doctorId,
          patient_id: activePatientId,
          patient_name: formData.patientName,
          appointment_date: formData.appointmentDate,
          start_time: formData.startTime,
          end_time: formData.endTime,
          consultation_type: formData.consultationType,
          body_system: formData.bodySystem || 'General',
          symptoms: formData.symptoms || [],
          pain_level: formData.painLevel || 0,
          reason: formData.reason || '',
          ref_code: formData.refCode || '',
          status: 'Confirmed',
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Direct insert error:', insertError);
      return { success: false, error: insertError.message };
    }

    // Revalidate relevant pages
    revalidatePath('/patient/dashboard/appointments/book');
    revalidatePath('/patient/dashboard');

    return { success: true, appointmentId: insertData.id };
  } catch (err: any) {
    console.error('Unhandled booking error:', err);
    return { success: false, error: err.message || 'An unexpected server error occurred.' };
  }
}