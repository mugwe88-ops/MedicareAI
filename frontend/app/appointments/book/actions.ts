'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

interface BookingPayload {
  doctorId: string
  appointmentDate: string
  timeSlot: string
  consultationType: string
  clinicalNotes?: string
}

export async function bookAppointment(payload: BookingPayload) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Safe to ignore in Server Actions if middleware handles session refreshes
          }
        },
      },
    }
  )

  // Strictly validate user via Supabase Auth server
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return {
      success: false,
      error: 'Authentication session not detected. Please ensure you are logged in.'
    }
  }

  // Insert appointment into the database
  const { data, error: insertError } = await supabase
    .from('appointments')
    .insert({
      patient_id: user.id,
      doctor_id: payload.doctorId,
      appointment_date: payload.appointmentDate,
      time_slot: payload.timeSlot,
      consultation_type: payload.consultationType,
      clinical_notes: payload.clinicalNotes || null,
      status: 'booked',
    })
    .select()
    .single()

  if (insertError) {
    console.error('Database insertion error:', insertError.message)
    return {
      success: false,
      error: `Failed to save appointment: ${insertError.message}`
    }
  }

  revalidatePath('/patient/dashboard')
  revalidatePath('/patient/appointments')
  revalidatePath('/doctor/appointments')

  return { success: true, data }
}