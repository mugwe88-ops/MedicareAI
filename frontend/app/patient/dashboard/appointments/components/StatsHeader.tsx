"use client";

import { Clock, Calendar as CalendarIcon, CheckCircle2, Video } from "lucide-react";

interface StatsHeaderProps {
  stats: {
    upcoming: number;
    month: number;
    completed: number;
    telehealth: number;
  };
}

export default function StatsHeader({ stats }: StatsHeaderProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Upcoming</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.upcoming}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-blue-50 text-blue-600">
          <Clock size={20} />
        </div>
      </div>

      <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">This Month</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.month}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-indigo-50 text-indigo-600">
          <CalendarIcon size={20} />
        </div>
      </div>

      <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Completed</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.completed}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-600">
          <CheckCircle2 size={20} />
        </div>
      </div>

      <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Telehealth</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.telehealth}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-purple-50 text-purple-600">
          <Video size={20} />
        </div>
      </div>
    </div>
  );
}