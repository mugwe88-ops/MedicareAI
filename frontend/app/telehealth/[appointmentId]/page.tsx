'use client';

import { useEffect, useState, use } from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';

interface PageProps {
  params: Promise<{ appointmentId: string }>;
}

interface UserSession {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function VideoConsultPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const appointmentId = resolvedParams.appointmentId;

  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [sessionDoctor, setSessionDoctor] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);

  useEffect(() => {
    async function verifyAccess() {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (!token || !storedUser) {
          setErrorMessage('Please login to access your telehealth session.');
          setChecking(false);
          return;
        }

        // Parse and store the browser user state locally
        const parsedUser = JSON.parse(storedUser) as UserSession;
        setCurrentUser(parsedUser);

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
          setSessionDoctor(data.doctorName);
        } else {
          setErrorMessage(data.error || 'Access denied for this appointment slot.');
        }
      } catch (err) {
        setErrorMessage('Failed to connect to security authorization gates.');
      } finally {
        setChecking(false);
      }
    }

    verifyAccess();
  }, [appointmentId]);

  // Determine standard redirection dashboard fallback route based on role matrix
  const getExitPath = () => {
    return currentUser?.role?.toLowerCase() === 'doctor' ? '/doctors/dashboard' : '/dashboard';
  };

  // Determine the interactive display identity inside the room frame
  const getMeetingIdentity = () => {
    if (!currentUser) return 'Attendee';
    return currentUser.role?.toLowerCase() === 'doctor' 
      ? `Dr. ${currentUser.name}` 
      : currentUser.name;
  };

  // 1. Show loading state first
  if (checking) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center animate-pulse">
          <p className="text-lg font-bold text-slate-700">Verifying clinical entry credentials...</p>
        </div>
      </div>
    );
  }

  // 2. If backend verification fails, block the user right here
  if (!authorized) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md border border-slate-100">
          <h2 className="text-xl font-black text-red-600 mb-2 tracking-tight">Access Restrained</h2>
          <p className="text-slate-500 font-medium text-sm mb-6">{errorMessage}</p>
          <a 
            href={getExitPath()} 
            className="inline-block px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition shadow-md shadow-blue-100"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // 3. Render authenticated encrypted interface frame
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 h-screen flex flex-col bg-slate-50">
      <div className="mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {currentUser?.role?.toLowerCase() === 'doctor' 
              ? `Patient Video Consultation` 
              : `Consultation with Dr. ${sessionDoctor}`}
          </h1>
          <p className="text-xs text-slate-400 font-bold mt-1">
            Session Track Hash: <span className="font-mono bg-slate-200/60 px-1.5 py-0.5 rounded text-slate-600 text-[11px] ml-1">{appointmentId}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-600 font-black bg-emerald-100/60 border border-emerald-200 px-3 py-1.5 rounded-full uppercase tracking-wider self-start sm:self-center">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          End-to-End Secure
        </div>
      </div>

      <div className="flex-1 w-full bg-slate-950 rounded-3xl shadow-2xl min-h-[500px] overflow-hidden border border-slate-900">
        <JitsiMeeting
          domain="meet.jit.si"
          roomName={`medicareai-session-${appointmentId}`}
          configOverwrite={{
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            prejoinPageEnabled: false, // Bypasses extra setup screen for swift joining
          }}
          interfaceConfigOverwrite={{
            TOOLBAR_BUTTONS: [
              'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
              'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
              'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
              'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
              'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
              'security'
            ],
          }}
          userInfo={{
            displayName: getMeetingIdentity(),
            email: currentUser?.email || 'user@medicareai.com',
          }}
          onReadyToClose={() => {
            window.location.href = getExitPath();
          }}
          getIFrameRef={(iframeRef) => {
            if (iframeRef) {
              iframeRef.style.height = '100%';
              iframeRef.style.width = '100%';
            }
          }}
        />
      </div>
    </div>
  );
}