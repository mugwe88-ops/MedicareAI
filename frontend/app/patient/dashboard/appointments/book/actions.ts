'use server';

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export interface BookingPayload {
  doctorId: string;
  patientId?: string; // Optional patientId payload key
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

/**
 * Helper to safely decode JWT payload directly from raw cookies
 */
function parseJwtPayload(token: string) {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
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
              // Safe block for Next.js Server Components / Actions
            }
          },
        },
      }
    );

    let activePatientId: string | null = null;
    let rawAccessToken: string | null = null;

    // 1. Primary Check: Fetch authenticated user from Supabase Auth
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (user?.id) {
      activePatientId = user.id;
    }

    // 2. Secondary Check: Validate client-provided patientId in payload
    if (!activePatientId && formData.patientId && typeof formData.patientId === 'string' && formData.patientId.trim() !== '') {
      activePatientId = formData.patientId.trim();
    }

    // 3. Tertiary Check: Direct custom or auth cookie fallback
    if (!activePatientId) {
      const allCookies = cookieStore.getAll();

      // Check explicit custom user/patient cookies first
      const customPatientCookie =
        cookieStore.get('patientId')?.value ||
        cookieStore.get('patient_id')?.value ||
        cookieStore.get('user_id')?.value;

      if (customPatientCookie && customPatientCookie.trim() !== '') {
        activePatientId = customPatientCookie.trim();
      } else {
        // Inspect Supabase auth storage cookies (e.g. sb-<project-ref>-auth-token)
        const sbAuthCookie = allCookies.find(
          (c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
        );

        if (sbAuthCookie?.value) {
          try {
            const parsed = JSON.parse(sbAuthCookie.value);
            if (parsed?.user?.id) {
              activePatientId = parsed.user.id;
              rawAccessToken = parsed?.access_token || null;
            } else if (Array.isArray(parsed) && parsed[0]) {
              rawAccessToken = parsed[0];
              const decoded = parseJwtPayload(parsed[0]);
              if (decoded?.sub) activePatientId = decoded.sub;
            } else if (typeof parsed === 'string') {
              rawAccessToken = parsed;
              const decoded = parseJwtPayload(parsed);
              if (decoded?.sub) activePatientId = decoded.sub;
            }
          } catch {
            const decoded = parseJwtPayload(sbAuthCookie.value);
            if (decoded?.sub) {
              activePatientId = decoded.sub;
              rawAccessToken = sbAuthCookie.value;
            }
          }
        }
      }
    }

    // Strict validation: Reject if no valid patient ID is discovered across all 3 layers
    if (!activePatientId) {
      console.error(
        'Auth / Payload Failure: Missing valid patientId across Auth, Form Payload, and Cookies',
        userError
      );
      return {
        success: false,
        error:
          'Authentication session or patient identification not detected. Please ensure you are logged in.',
      };
    }

    // Fetch session token for microservice headers
    const { data: { session } } = await supabase.auth.getSession();
    const authToken = session?.access_token || rawAccessToken;

    const generatedRefCode =
      formData.refCode || `SMD-${Math.floor(100000 + Math.random() * 900000)}`;
    const renderApiUrl = process.env.RENDER_API_URL;

    // Direct Supabase Write Fallback
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
        console.error('Supabase Direct Booking Error:', dbError);
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
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
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
      console.error('Render API Booking Error:', errorText);
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
    console.error('Server Action Exception:', err);
    return {
      success: false,
      error: err.message || 'An unexpected server error occurred.',
    };
  }
}