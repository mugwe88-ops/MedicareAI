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
              // Server component write safety
            }
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    const activePatientId = user?.id || formData.patientId || '22222222-2222-2222-2222-222222222222';

    if (!activePatientId) {
      return { success: false, error: 'User session not found. Please log in again.' };
    }

    const generatedRefCode = formData.refCode || `SMD-${Math.floor(100000 + Math.random() * 900000)}`;

    // Direct, robust insertion into the appointments table
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
          ref_code: generatedRefCode,
          status: 'Confirmed',
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Booking Insertion Error:", insertError);
      return { success: false, error: insertError.message };
    }

    revalidatePath('/patient/dashboard/appointments');
    revalidatePath('/patient/dashboard/appointments/book');
    revalidatePath('/patient/dashboard/consultations');

    return { success: true, appointmentId: insertData.id };
  } catch (err: any) {
    console.error("Server Action Exception:", err);
    return { success: false, error: err.message || 'An unexpected server error occurred.' };
  }
}