'use server';

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@supabase/ssr';
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
    const cookieStore = await cookies();

    // Initialize Supabase Server Client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Handled when called from a Server Component
            }
          },
        },
      }
    );

    // Validate current authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const activePatientId = user?.id || formData.patientId;

    if (!activePatientId) {
      return { success: false, error: 'User session not found. Please log in again.' };
    }

    // Call Atomic RPC Booking
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

    if (!rpcError && rpcData) {
      if (rpcData.success === false) {
        return { success: false, error: rpcData.error || 'Failed to reserve appointment slot.' };
      }

      revalidatePath('/patient/dashboard/appointments/book');
      revalidatePath('/patient/dashboard');
      return { success: true, appointmentId: rpcData.appointment_id || rpcData.id };
    }

    // Fallback Table Insert
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
      return { success: false, error: insertError.message };
    }

    revalidatePath('/patient/dashboard/appointments/book');
    revalidatePath('/patient/dashboard');

    return { success: true, appointmentId: insertData.id };
  } catch (err: any) {
    return { success: false, error: err.message || 'An unexpected server error occurred.' };
  }
}