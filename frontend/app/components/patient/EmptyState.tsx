'use client';

import React from 'react';
import { User, RefreshCw, Calendar } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  onClearFilters: () => void;
}

export default function EmptyState({ title, description, onClearFilters }: EmptyStateProps) {
  return (
    <div className="p-10 rounded-3xl bg-[#0d1424] border border-slate-800/80 text-center space-y-4 shadow-xl">
      <div className="w-16 h-16 rounded-full bg-blue-950/60 border border-blue-800/40 flex items-center justify-center mx-auto text-blue-400">
        <User className="w-8 h-8" />
      </div>
      <div className="max-w-md mx-auto space-y-1">
        <h3 className="text-base font-bold text-white">{title}</h3>
        <p className="text-xs text-slate-400">{description}</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        <button
          onClick={onClearFilters}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reset Filters
        </button>
        <button
          onClick={onClearFilters}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-800 transition flex items-center gap-1.5"
        >
          <Calendar className="w-3.5 h-3.5 text-emerald-400" /> View All Available Doctors
        </button>
      </div>
    </div>
  );
}