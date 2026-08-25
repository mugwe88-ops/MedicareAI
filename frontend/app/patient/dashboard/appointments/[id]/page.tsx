'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Appointment {
  id: string;
  patient_name: string;
  doctor_name: string;
  appointment_date: string;
  status: string;
  telehealth_room_url?: string;
  notes?: string;
}

export default function AppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params safely using React.use() for Next.js App Router compatibility
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const router = useRouter();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchAppointment() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'https://medicareai-yb5c.onrender.com'}/api/appointments/${id}`
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
    return <div className="p-12 text-center text-slate-500 font-medium">Loading appointment details...</div>;
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-12 p-6 bg-white border border-red-100 rounded-2xl shadow-sm text-center">
        <p className="text-red-600 font-semibold mb-4">Error: {error}</p>
        <button
          onClick={() => router.back()}
          className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition shadow-sm"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!appointment) {
    return <div className="p-12 text-center text-slate-500 font-medium">Appointment not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8 bg-white shadow-sm border border-slate-200 rounded-2xl mt-8">
      {/* Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-6 mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Appointment Details</h1>
          <p className="text-xs font-mono text-slate-400 mt-1">ID: {appointment.id}</p>
        </div>
        <span
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide w-fit ${
            appointment.status === 'Confirmed'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : appointment.status === 'Pending'
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          {appointment.status}
        </span>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Assigned Doctor</p>
          <p className="text-base font-bold text-slate-800">{appointment.doctor_name}</p>
        </div>
        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Patient</p>
          <p className="text-base font-bold text-slate-800">{appointment.patient_name}</p>
        </div>
        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 md:col-span-2">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Date & Time</p>
          <p className="text-base font-bold text-slate-800">
            {new Date(appointment.appointment_date).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Clinical Notes */}
      {appointment.notes && (
        <div className="mb-8 bg-blue-50/30 p-5 rounded-xl border border-blue-100">
          <p className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-1.5">Clinical Notes</p>
          <p className="text-slate-600 text-sm whitespace-pre-line leading-relaxed">{appointment.notes}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 pt-6 border-t border-slate-100">
        <Link
          href={`/patient/dashboard/telehealth/${appointment.id}`}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition shadow-sm shadow-blue-600/20"
        >
          Join Telehealth Room
        </Link>
        <button
          onClick={() => alert('Reschedule flow triggers here')}
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition"
        >
          Reschedule
        </button>
        <button
          onClick={() => alert('Cancel flow triggers here')}
          className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-sm rounded-xl transition ml-auto"
        >
          Cancel Appointment
        </button>
      </div>
    </div>
  );
}