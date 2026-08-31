"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, CheckCircle, Plus } from "lucide-react";

export default function ScheduleManagerDashboard() {
  const [feedback] = useState<string | null>(null);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Schedule Manager</h1>
        <p className="text-sm text-slate-500 mt-0.5">Configure your active practice hours and view your monthly practice calendar.</p>
      </div>

      {feedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm font-medium flex items-center gap-2">
          <CheckCircle size={18} /> {feedback}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <CalendarIcon className="text-blue-600" size={18} /> Configure Availability Slots
        </h2>
        <p className="text-xs text-slate-500">Your schedule management panel is active.</p>
      </div>
    </div>
  );
}
