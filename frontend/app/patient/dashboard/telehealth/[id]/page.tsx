'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';

interface Appointment {
  id: string;
  patient_name: string;
  doctor_name: string;
  appointment_date: string;
  status: string;
  telehealth_room_url?: string;
  notes?: string;
}

export default function TelehealthRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVideoOff, setIsVideoOff] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;

    async function fetchRoomDetails() {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'https://medicareai-yb5c.onrender.com'}/api/appointments/${id}`,
          {
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
              'Content-Type': 'application/json',
            },
          }
        );

        if (!res.ok) {
          throw new Error('Failed to load telehealth room details.');
        }
        const data = await res.json();
        setAppointment(data);
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchRoomDetails();
  }, [id]);

  if (loading) {
    return <div className="p-12 text-center text-slate-500 font-medium">Connecting to secure telehealth room...</div>;
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

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 flex flex-col h-[calc(100vh-2rem)]">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Telehealth Consultation</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Doctor: <span className="font-bold text-slate-700">{appointment?.doctor_name}</span> | Patient: <span className="font-bold text-slate-700">{appointment?.patient_name}</span>
          </p>
        </div>
        <button
          onClick={() => router.push('/patient/dashboard/appointments')}
          className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl transition"
        >
          Leave Room
        </button>
      </div>

      {/* Video Grid / Main Room Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 mb-4 min-h-[400px]">
        {/* Main Video Window */}
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl relative overflow-hidden flex items-center justify-center shadow-inner border border-slate-800">
          {isVideoOff ? (
            <div className="text-slate-400 font-medium text-sm flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-xl font-bold text-slate-300">
                {appointment?.doctor_name?.charAt(0) || 'D'}
              </div>
              Camera is turned off
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-slate-300 text-sm font-medium">
              <div className="text-center">
                <p className="text-lg font-bold text-white mb-1">{appointment?.doctor_name || 'Assigned Doctor'}</p>
                <p className="text-xs text-slate-400">Secure Video Feed Active</p>
              </div>
            </div>
          )}

          {/* Self view badge */}
          <div className="absolute bottom-4 right-4 w-36 h-24 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center text-xs text-slate-400 shadow-lg">
            You (Patient)
          </div>
        </div>

        {/* Sidebar / Notes */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-3">Consultation Notes</h2>
          <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 mb-4 overflow-y-auto">
            {appointment?.notes || 'No clinical notes added yet for this session.'}
          </div>
          <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
            <p className="text-xs font-bold text-blue-900 mb-1">Session Status</p>
            <p className="text-xs text-blue-700">Connected via secure SwiftMD WebRTC gateway.</p>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center gap-4">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs transition ${
            isMuted ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {isMuted ? 'Unmute Mic' : 'Mute Mic'}
        </button>
        <button
          onClick={() => setIsVideoOff(!isVideoOff)}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs transition ${
            isVideoOff ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
        </button>
        <button
          onClick={() => router.push('/patient/dashboard/appointments')}
          className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition shadow-sm"
        >
          End Call
        </button>
      </div>
    </div>
  );
}
