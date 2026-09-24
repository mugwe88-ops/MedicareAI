'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { bookAppointment } from '@/app/appointments/book/actions'

interface BookingData {
  doctorId: string
  appointmentDate: string
  timeSlot: string
  consultationType: string
}

interface ClinicalIntakeStepProps {
  bookingData: BookingData
  onBack: () => void
}

export default function ClinicalIntakeStep({ bookingData, onBack }: ClinicalIntakeStepProps) {
  const [clinicalNotes, setClinicalNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)

    try {
      // 1. Double-check client-side session to guarantee the token exists 
      // before invoking the server action
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !session) {
        setErrorMessage('Authentication session not detected. Please ensure you are logged in.')
        setLoading(false)
        // Redirect to login preserving the return URL
        setTimeout(() => {
          router.push('/login?redirect=/patient/dashboard/appointments/book')
        }, 1500)
        return
      }

      // 2. Invoke the server action with all accumulated booking payload fields
      const result = await bookAppointment({
        doctorId: bookingData.doctorId,
        appointmentDate: bookingData.appointmentDate,
        timeSlot: bookingData.timeSlot,
        consultationType: bookingData.consultationType,
        clinicalNotes,
      })

      if (!result.success) {
        setErrorMessage(result.error || 'Failed to complete booking. Please try again.')
        setLoading(false)
        return
      }

      // 3. Success: Redirect to patient appointments view
      router.push('/patient/dashboard/appointments?success=true')
    } catch (err) {
      console.error('Unexpected error during submission:', err)
      setErrorMessage('A network or server error occurred. Please check your connection.')
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 text-slate-100 shadow-xl">
        <h2 className="text-xl font-bold mb-4 tracking-tight text-white">
          Clinical Intake & Symptoms
        </h2>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-950/80 border border-red-800 text-red-200 rounded-xl text-sm flex items-center space-x-3">
            <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Additional Notes / Reason for Visit
            </label>
            <textarea
              rows={5}
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              placeholder="Briefly describe your symptoms or reason for consulting..."
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-4 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onBack}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-50 font-medium"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Securing Appointment...</span>
                </>
              ) : (
                <span>Complete Booking</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}