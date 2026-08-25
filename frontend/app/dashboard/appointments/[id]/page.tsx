'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Appointment {
  id: string;
  patient_name: string;
  doctor_name: string;
  appointment_date: string;
  status: string;
  telehealth_room_url?: string;
  notes?: string;
}

export default function AppointmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchAppointment() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/appointments/${id}`
        );
        if (!res.ok) {
          throw new Error('Failed to fetch appointment details');
        }
        const data = await res.json();
        setAppointment(data);
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchAppointment();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-gray-600">Loading appointment details...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>Error: {error}</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!appointment) {
    return <div className="p-8 text-center text-gray-600">Appointment not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg mt-8">
      {/* Header & Status */}
      <div className="flex justify-between items-center border-b pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Appointment Details</h1>
          <p className="text-xs font-mono text-gray-400 mt-1">ID: {appointment.id}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${
            appointment.status === 'Confirmed'
              ? 'bg-green-100 text-green-800'
              : appointment.status === 'Pending'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {appointment.status}
        </span>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <p className="text-sm text-gray-500 font-medium">Assigned Doctor</p>
          <p className="text-lg text-gray-800">{appointment.doctor_name}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">Patient</p>
          <p className="text-lg text-gray-800">{appointment.patient_name}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">Date & Time</p>
          <p className="text-lg text-gray-800">
            {new Date(appointment.appointment_date).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Clinical Notes */}
      {appointment.notes && (
        <div className="mb-6 bg-gray-50 p-4 rounded-md border border-gray-100">
          <p className="text-sm font-medium text-gray-700 mb-1">Clinical Notes</p>
          <p className="text-gray-600 text-sm whitespace-pre-line">{appointment.notes}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 pt-4 border-t">
        {appointment.telehealth_room_url && (
          <a
            href={appointment.telehealth_room_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-sm"
          >
            Join Telehealth Room
          </a>
        )}
        <button
          onClick={() => alert('Reschedule flow triggers here')}
          className="px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition"
        >
          Reschedule
        </button>
        <button
          onClick={() => alert('Cancel flow triggers here')}
          className="px-5 py-2.5 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition"
        >
          Cancel Appointment
        </button>
      </div>
    </div>
  );
}