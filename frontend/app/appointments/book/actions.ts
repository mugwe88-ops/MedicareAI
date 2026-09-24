'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface BookingPayload {
  doctorId: string
  appointmentDate: string
  timeSlot: string
  consultationType: string
  clinicalNotes?: string
}

export async function bookAppointment(payload: BookingPayload) {
  const supabase = createClient()

  // 1. Strictly validate the user using getUser() instead of getSession()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return {
      success: false,
      error: 'Authentication session not detected or expired. Please log in again.'
    }
  }

  // 2. Insert appointment with verified patient_id
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
    console.error('Appointment booking insertion failed:', insertError.message)
    return {
      success: false,
      error: 'Failed to save appointment. Please try again.'
    }
  }

  // 3. Revalidate dashboard paths so data updates immediately
  revalidatePath('/patient/dashboard')
  revalidatePath('/patient/appointments')
  revalidatePath('/doctor/appointments')

  return { success: true, data }
}