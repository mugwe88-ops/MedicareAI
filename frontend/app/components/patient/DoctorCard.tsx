'use client';

import React from 'react';
import { Star, Building, Video, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Doctor } from '@/lib/supabase';

interface DoctorCardProps {
  doctor: Doctor;
  isSelected: boolean;
  onSelect: (doc: Doctor) => void;
  onProceed: (doc: Doctor) => void;
}

export default function DoctorCard({ doctor, isSelected, onSelect, onProceed }: DoctorCardProps) {
  return (
    <div
      onClick={() => onSelect(doctor)}
      className={`p-5 rounded-3xl border transition-all duration-300 cursor-pointer relative overflow-hidden group ${
        isSelected
          ? 'bg-gradient-to-b from-[#0d1a38] to-[#0a1226] border-blue-500 shadow-xl shadow-blue-950/50 ring-1 ring-blue-500/50'
          : 'bg-[#0d1424] border-slate-800/80 hover:border-slate-700 hover:-translate-y-1'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-950 border border-blue-500/30 flex items-center justify-center font-bold text-blue-300 text-lg shrink-0 shadow-lg group-hover:scale-105 transition-transform">
          {doctor.full_name.split(' ').map((n) => n[0]).join('')}
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
              {doctor.full_name}
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            </h3>
            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-800/40">
              <Star className="w-3 h-3 fill-amber-400" /> {doctor.rating || '4.9'}
            </span>
          </div>
          <p className="text-xs font-semibold text-blue-400">{doctor.specialty}</p>
          <p className="text-[10px] text-slate-400 flex items-center gap-1">
            <Building className="w-3 h-3 text-slate-500" /> {(doctor as any).location || 'Swift MD Central Clinic'}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className="px-2 py-0.5 rounded-md bg-emerald-950/50 border border-emerald-800/40 text-[9px] font-bold text-emerald-400 flex items-center gap-1">
          <Video className="w-3 h-3" /> Telehealth
        </span>
        <span className="px-2 py-0.5 rounded-md bg-blue-950/50 border border-blue-800/40 text-[9px] font-bold text-blue-300 flex items-center gap-1">
          <Building className="w-3 h-3" /> In-Clinic
        </span>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-bold">Consultation Fee</span>
          <span className="font-black text-white text-sm">KES {doctor.consultation_fee || 3500}</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onProceed(doctor);
          }}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition flex items-center gap-1"
        >
          Select Doctor <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}