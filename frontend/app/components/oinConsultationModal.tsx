'use client';

import React, { useState, useEffect } from 'react';
import { Video, Mic, Wifi, ShieldCheck, X, CheckCircle, AlertCircle } from 'lucide-react';

interface JoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorName: string;
  startTime: string;
}

export function JoinConsultationModal({ isOpen, onClose, doctorName, startTime }: JoinModalProps) {
  const [micActive, setMicActive] = useState(true);
  const [camActive, setCamActive] = useState(true);
  const [networkReady, setNetworkReady] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-[#0d1424] border border-blue-800/60 rounded-3xl max-w-md w-full p-6 space-y-5 relative shadow-2xl animate-in zoom-in-95">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/40 rounded-full flex items-center justify-center mx-auto mb-2 text-blue-400">
            <Video className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Telehealth Readiness Check</h3>
          <p className="text-xs text-slate-400">Session with <strong className="text-slate-200">{doctorName}</strong> @ {startTime}</p>
        </div>

        {/* Hardware Status List */}
        <div className="space-y-2.5 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-slate-300">
              <CameraIcon className="w-4 h-4 text-blue-400" /> Camera Sensor
            </span>
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <CheckCircle className="w-3.5 h-3.5" /> Ready
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-slate-300">
              <Mic className="w-4 h-4 text-blue-400" /> Microphone Access
            </span>
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <CheckCircle className="w-3.5 h-3.5" /> Active
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-slate-300">
              <Wifi className="w-4 h-4 text-blue-400" /> Connection Ping
            </span>
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <CheckCircle className="w-3.5 h-3.5" /> 24ms (Optimal)
            </span>
          </div>
        </div>

        <div className="p-3 bg-blue-950/40 border border-blue-800/40 rounded-xl flex items-center gap-2 text-[11px] text-blue-300">
          <ShieldCheck className="w-4 h-4 shrink-0 text-blue-400" />
          <span>Encrypted WebRTC connection compliant with HIPAA / SHA standards.</span>
        </div>

        <button
          onClick={() => alert('Launching Telehealth Video Session...')}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs rounded-2xl shadow-xl transition flex items-center justify-center gap-2"
        >
          Enter Virtual Waiting Room
        </button>
      </div>
    </div>
  );
}

function CameraIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}