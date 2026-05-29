'use client';

import { useEffect, useRef, useState, use } from 'react';
import DailyIframe from '@daily-co/daily-js';

interface PageProps {
  params: Promise<{ appointmentId: string }>;
}

export default function VideoConsultPage({ params }: PageProps) {
  // Unwrap the async params for Next.js App Router compliance
  const resolvedParams = use(params);
  const appointmentId = resolvedParams.appointmentId;

  const containerRef = useRef<HTMLDivElement>(null);
  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Ask your Express Backend to create/fetch the Daily room link
  useEffect(() => {
    async function fetchRoom() {
      try {
        // FIX: Points directly to your active production Render URL endpoint
        const BACKEND_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://medicareai-backend.onrender.com';
        
        const res = await fetch(`${BACKEND_BASE}/api/telehealth/create-room`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ appointmentId }),
        });
        
        if (!res.ok) throw new Error('Could not authorize clinical session.');
        
        const data = await res.json();
        setRoomUrl(data.url);
      } catch (err: any) {
        setError(err.message || 'Something went wrong while setting up the call.');
      } finally {
        setLoading(false);
      }
    }
    fetchRoom();
  }, [appointmentId]);

  // 2. Inject Daily Prebuilt video into our page container
  useEffect(() => {
    if (!roomUrl || !containerRef.current) return;

    // Creates the secure embedded meeting panel
    const callFrame = DailyIframe.createFrame(containerRef.current, {
      iframeStyle: {
        width: '100%',
        height: '100%',
        border: '0',
        borderRadius: '12px',
      },
      showLeaveButton: true,
    });

    callFrame.join({ url: roomUrl });

    // Handle when user hits the red "Leave" button
    callFrame.on('left-meeting', () => {
      window.location.href = '/dashboard';
    });

    return () => {
      callFrame.destroy();
    };
  }, [roomUrl]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center animate-pulse">
          <p className="text-lg font-semibold text-slate-700">Securing private clinical connection...</p>
          <p className="text-sm text-slate-400 mt-1">Checking video encryption parameters</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">Connection Error</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <a href="/" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 h-screen flex flex-col bg-slate-50">
      {/* Header element */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">SwiftMD Telehealth Session</h1>
          <p className="text-sm text-slate-500">Secure Consultation Reference: <span className="font-mono bg-slate-200 px-1 py-0.5 rounded text-xs">{appointmentId}</span></p>
        </div>
        <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 self-start">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
          HIPAA Encrypted Channel
        </div>
      </div>

      {/* The Daily Iframe container takes all remaining vertical space */}
      <div 
        ref={containerRef} 
        className="flex-1 w-full bg-slate-950 rounded-xl shadow-2xl min-h-[500px]" 
      />
    </div>
  );
}