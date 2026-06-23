'use client';

import { useRouter } from "next/navigation";
import { Video, ShieldCheck } from "lucide-react";

export default function TelehealthLandingPage() {
  const router = useRouter();

  const handleJoinRoom = (appointmentId: string) => {
    router.push(`/telehealth/${appointmentId}`);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen text-slate-100">
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tight text-white">Telehealth Hub</h1>
        <p className="text-slate-400 text-sm mt-1">Join high-definition secure clinical video calls with your assigned practitioners.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between shadow-xl">
          <div>
            <div className="w-10 h-10 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center mb-4">
              <Video className="w-5 h-5 text-orange-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-200">Active Virtual Consultations</h2>
            <p className="text-xs text-slate-400 mt-1 mb-6">Ready to connect? Enter your pre-booked session securely below.</p>
          </div>
          
          <button 
            onClick={() => handleJoinRoom("active-session")}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-xl transition-all text-sm text-center shadow-lg shadow-blue-600/10"
          >
            Launch Consultation Room
          </button>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between shadow-xl">
          <div>
            <div className="w-10 h-10 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5 text-green-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-200">System Checklist</h2>
            <p className="text-xs text-slate-400 mt-1">Please ensure browser permissions for web-camera and microphone devices are allowed before entry.</p>
          </div>
          <div className="mt-6 flex items-center gap-2 text-xs text-green-400 font-bold tracking-wider bg-green-950/20 border border-green-900/30 px-3 py-2 rounded-lg w-max">
            ● WEBRTC HARDWARE READY
          </div>
        </div>
      </div>
    </div>
  );
}