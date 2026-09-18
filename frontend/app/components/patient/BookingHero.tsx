'use client';

import React from 'react';
import { ShieldCheck, Activity, Clock, Check } from 'lucide-react';

interface BookingHeroProps {
  patientName?: string;
  step: number;
}

export default function BookingHero({ patientName = 'Patient', step }: BookingHeroProps) {
  return (
    <div className="bg-gradient-to-r from-blue-950/90 via-[#0a1228] to-[#080d1a] border border-blue-800/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-full bg-blue-900/60 border border-blue-500/40 text-[10px] font-bold text-blue-300 uppercase tracking-widest flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> 256-Bit Encrypted
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-950/50 border border-emerald-800/50 text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 animate-pulse" /> Live Sync Active
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[10px] text-slate-400 flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> Est. Booking: &lt; 2 mins
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Welcome back, {patientName}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Book your medical consultation with top-tier physicians in under 2 minutes.
          </p>
        </div>

        {/* STEP INDICATOR WITH CONNECTED LINE */}
        <div className="flex items-center gap-2 bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80 shrink-0">
          {[
            { num: 1, label: 'Doctor' },
            { num: 2, label: 'Schedule' },
            { num: 3, label: 'Intake' },
          ].map((s, i) => (
            <React.Fragment key={s.num}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${
                    step === s.num
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50 ring-2 ring-blue-400/40'
                      : step > s.num
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-slate-900 text-slate-600'
                  }`}
                >
                  {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                </div>
                <span className={`text-[10px] font-bold hidden sm:inline ${step === s.num ? 'text-white' : 'text-slate-500'}`}>
                  {s.label}
                </span>
              </div>
              {i < 2 && <div className={`w-4 h-0.5 ${step > i + 1 ? 'bg-emerald-500' : 'bg-slate-800'}`} />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}