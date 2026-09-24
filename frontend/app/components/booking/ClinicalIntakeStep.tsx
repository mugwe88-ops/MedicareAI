'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { bookAppointment } from '@/app/appointments/book/actions'

interface ClinicalIntakeStepProps {
  bookingData: {
    doctorId: string
    appointmentDate: string
    timeSlot: string
    consultationType: string
  }
  onBack: () => void
}

export default function ClinicalIntakeStep({ bookingData, onBack }: ClinicalIntakeStepProps) {
  const [clinicalNotes, setClinicalNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)

    try {
      const result = await bookAppointment({
        ...bookingData,
        clinicalNotes,
      })

      if (!result.success) {
        // If session expired, redirect user to login with return URL
        if (result.error?.includes('Authentication')) {
          router.push(`/login?redirect=/appointments/book`)
          return
        }
        setErrorMessage(result.error || 'An unexpected error occurred.')
        setLoading(false)
        return
      }

      // Success: Navigate to confirmation or dashboard
      router.push('/patient/appointments?success=true')
    } catch (err) {
      console.error('Submission error:', err)
      setErrorMessage('Network error. Please check your connection.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Clinical Intake & Symptoms</h2>
      
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {errorMessage}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Please describe your symptoms or reason for visit:
        </label>
        <textarea
          rows={4}
          value={clinicalNotes}
          onChange={(e) => setClinicalNotes(e.target.value)}
          placeholder="Mention key symptoms, duration, or specific concerns..."
          className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div className="flex justify-between items-center pt-4">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Confirming Booking...' : 'Complete Booking'}
        </button>
      </div>
    </form>
  )
}