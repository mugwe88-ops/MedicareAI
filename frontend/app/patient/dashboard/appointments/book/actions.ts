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

    // Strictly fetch and verify authenticated user from Supabase Auth
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { 
        success: false, 
        error: 'Authentication required. Please log in again to complete your booking.' 
      };
    }

    // Enforce patient_id strictly matching auth.users.id
    const activePatientId = user.id;

    // Fetch session access token for downstream authorization headers if needed
    const { data: { session } } = await supabase.auth.getSession();

    const generatedRefCode = formData.refCode || `SMD-${Math.floor(100000 + Math.random() * 900000)}`;
    const renderApiUrl = process.env.RENDER_API_URL;

    // Direct Supabase Fallback: Write directly to database with verified auth.users ID
    if (!renderApiUrl || renderApiUrl.includes('your-render-app.onrender.com')) {
      const { data: appointment, error: dbError } = await supabase
        .from('appointments')
        .insert({
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
        })
        .select()
        .single();

      if (dbError) {
        console.error("Supabase Direct Booking Error:", dbError);
        return { success: false, error: dbError.message };
      }

      revalidatePath('/patient/dashboard/appointments');
      revalidatePath('/patient/dashboard/appointments/book');
      revalidatePath('/patient/dashboard/consultations');

      return { success: true, appointmentId: appointment.id };
    }

    // Dispatch request to external backend API with verified patient ID
    const response = await fetch(`${renderApiUrl}/api/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
      },
      body: JSON.stringify({
        doctorId: formData.doctorId,
        patientId: activePatientId,
        patientName: formData.patientName,
        appointmentDate: formData.appointmentDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        consultationType: formData.consultationType,
        bodySystem: formData.bodySystem || 'General',
        symptoms: formData.symptoms || [],
        painLevel: formData.painLevel || 0,
        reason: formData.reason || '',
        refCode: generatedRefCode,
        status: 'Confirmed',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Render API Booking Error:", errorText);
      return {
        success: false,
        error: `Render API returned status ${response.status}. Please check backend service configurations.`,
      };
    }

    const result = await response.json();

    revalidatePath('/patient/dashboard/appointments');
    revalidatePath('/patient/dashboard/appointments/book');
    revalidatePath('/patient/dashboard/consultations');

    return { success: true, appointmentId: result.id || result.appointmentId };
  } catch (err: any) {
    console.error("Server Action Exception:", err);
    return { success: false, error: err.message || 'An unexpected server error occurred.' };
  }
}