'use client';

import React from 'react';
import { Star, Video, Zap, CheckCircle } from 'lucide-react';
import { Doctor } from '@/lib/supabase';

interface FeaturedDoctorsProps {
  doctors: Doctor[];
  selectedDoctorId?: string;
  onSelectDoctor: (doc: Doctor) => void;
}

export default function FeaturedDoctors({ doctors, selectedDoctorId, onSelectDoctor }: FeaturedDoctorsProps) {
  if (!doctors || doctors.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" /> Featured Physicians Available Today
        </h2>
        <span className="text-[10px] text-blue-400 font-bold">Top Verified Ratings</span>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-blue-600/30">
        {doctors.slice(0, 5).map((doc) => {
          const isSelected = selectedDoctorId === doc.id;
          return (
            <div
              key={`feat-${doc.id}`}
              onClick={() => onSelectDoctor(doc)}
              className={`min-w-[240px] sm:min-w-[260px] p-4 rounded-2xl border transition-all cursor-pointer group shrink-0 ${
                isSelected
                  ? 'bg-blue-950/80 border-blue-500 ring-1 ring-blue-500'
                  : 'bg-[#0d1424] border-slate-800/80 hover:border-blue-500/50 hover:-translate-y-1'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-950 border border-blue-500/30 flex items-center justify-center font-bold text-blue-300 text-xs shrink-0 group-hover:scale-105 transition-transform">
                  {doc.full_name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold text-white truncate flex items-center gap-1">
                    {doc.full_name} <CheckCircle className="w-3 h-3 text-blue-400 shrink-0" />
                  </h4>
                  <p className="text-[10px] text-blue-400 truncate">{doc.specialty}</p>
                  <div className="flex items-center gap-1 text-[9px] text-amber-400 font-bold mt-0.5">
                    <Star className="w-3 h-3 fill-amber-400" /> {doc.rating || '4.9'}
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Video className="w-3 h-3" /> Telehealth Ready
                </span>
                <span className="font-bold text-slate-200">KES {doc.consultation_fee || 3500}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}