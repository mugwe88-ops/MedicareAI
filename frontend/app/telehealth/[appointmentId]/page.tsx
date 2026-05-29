'use client';

import { use } from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';

interface PageProps {
  params: Promise<{ appointmentId: string }>;
}

export default function VideoConsultPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const appointmentId = resolvedParams.appointmentId;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 h-screen flex flex-col bg-slate-50">
      {/* Header element */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">SwiftMD Telehealth Session</h1>
          <p className="text-sm text-slate-500">
            Secure Consultation Reference:{' '}
            <span className="font-mono bg-slate-200 px-1 py-0.5 rounded text-xs">{appointmentId}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 self-start">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
          Secure Free Stream
        </div>
      </div>

      {/* Embedded Jitsi Meeting frame wrapper */}
      <div className="flex-1 w-full bg-slate-950 rounded-xl shadow-2xl min-h-[500px] overflow-hidden">
        <JitsiMeeting
          domain="meet.jit.si"
          roomName={`medicareai-session-${appointmentId}`}
          configOverwrite={{
            startWithAudioMuted: true,
            disableModeratorIndicator: true,
            startWithVideoMuted: false,
            enableEmailInStats: false,
          }}
          interfaceConfigOverwrite={{
            DISABLE_DOMINANT_SPEAKER_INDICATOR: true,
          }}
          userInfo={{
            displayName: 'Medical Consultant',
            email: 'provider@medicareai.com'
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