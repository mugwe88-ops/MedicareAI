'use client';

import { useEffect, useState, use } from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';

interface PageProps {
  params: Promise<{ appointmentId: string }>;
}

export default function VideoConsultPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const appointmentId = resolvedParams.appointmentId;

  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [doctorName, setDoctorName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function verifyAccess() {
      try {
        const token = localStorage.getItem('token'); // Retrieve auth token
        if (!token) {
          setErrorMessage('Please login to access your telehealth session.');
          setChecking(false);
          return;
        }

        const BACKEND_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://medicareai-1.onrender.com';
        
        const res = await fetch(`${BACKEND_BASE}/api/telehealth/verify-session/${appointmentId}`, {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' 
          },
        });

        const data = await res.json();

        if (res.ok && data.isValid) {
          setAuthorized(true);
          setDoctorName(data.doctorName);
        } else {
          setErrorMessage(data.error || 'Access denied.');
        }
      } catch (err) {
        setErrorMessage('Failed to connect to security authorization gates.');
      } finally {
        setChecking(false);
      }
    }

    verifyAccess();
  }, [appointmentId]);

  if (checking) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center animate-pulse">
          <p className="text-lg font-semibold text-slate-700">Verifying clinic credentials...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-md border border-slate-200">
          <h2 className="text-xl font-bold text-red-600 mb-2">Access Restrained</h2>
          <p className="text-slate-600 mb-6">{errorMessage}</p>
          <a href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
            Log In / Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 h-screen flex flex-col bg-slate-50">
      <div className="mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Consultation with Dr. {doctorName}</h1>
          <p className="text-sm text-slate-500">
            Session Token Reference: <span className="font-mono bg-slate-200 px-1 py-0.5 rounded text-xs">{appointmentId}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 self-start">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
          Verified Encrypted Channel
        </div>
      </div>

      <div className="flex-1 w-full bg-slate-950 rounded-xl shadow-2xl min-h-[500px] overflow-hidden">
        <JitsiMeeting
          domain="meet.jit.si"
          roomName={`medicareai-session-${appointmentId}`}
          configOverwrite={{
            startWithAudioMuted: false,
            startWithVideoMuted: false,
          }}
          userInfo={{
            displayName: 'Patient Attendee',
          }}
          onReadyToClose={() => {
            window.location.href = '/dashboard';
          }}
          getIFrameRef={(iframeRef) => {
            iframeRef.style.height = '100%';
            iframeRef.style.width = '100%';
          }}
        />
      </div>
    </div>
  );
}