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

    // Get current authenticated user session or token
    const { data: { session } } = await supabase.auth.getSession();
    const activePatientId = session?.user?.id || formData.patientId || '22222222-2222-2222-2222-222222222222';

    if (!activePatientId) {
      return { success: false, error: 'User session not found. Please log in again.' };
    }

    const generatedRefCode = formData.refCode || `SMD-${Math.floor(100000 + Math.random() * 900000)}`;

    const renderApiUrl = process.env.RENDER_API_URL || 'https://your-render-app.onrender.com';

    // Dispatch request to Render backend API
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

    const result = await response.json();

    if (!response.ok) {
      console.error("Render API Booking Error:", result);
      return { success: false, error: result.message || result.error || 'Failed to create appointment via Render API.' };
    }

    revalidatePath('/patient/dashboard/appointments');
    revalidatePath('/patient/dashboard/appointments/book');
    revalidatePath('/patient/dashboard/consultations');

    return { success: true, appointmentId: result.id || result.appointmentId };
  } catch (err: any) {
    console.error("Server Action Exception:", err);
    return { success: false, error: err.message || 'An unexpected server error occurred.' };
  }
}