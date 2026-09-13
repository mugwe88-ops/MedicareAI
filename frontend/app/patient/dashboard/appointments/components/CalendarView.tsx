"use client";

import { Calendar as CalendarIcon } from "lucide-react";

interface CalendarViewProps {
  activeView: "week" | "month";
  itemCount: number;
}

export default function CalendarView({ activeView, itemCount }: CalendarViewProps) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center">
      <div className="max-w-md mx-auto space-y-3">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
          <CalendarIcon className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800 capitalize">{activeView} Schedule Overview</h3>
        <p className="text-xs text-slate-500">
          Viewing {itemCount} matching appointment(s) mapped across your schedule calendar.
        </p>
        <div className="grid grid-cols-7 gap-2 pt-4 text-center border-t border-slate-100 text-xs font-bold text-slate-400 uppercase">
          <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
        </div>
        <div className="grid grid-cols-7 gap-2 text-center text-xs py-6 bg-slate-50/50 rounded-2xl border border-slate-100 font-medium text-slate-600">
          {Array.from({ length: 28 }).map((_, i) => (
            <div
              key={i}
              className={`p-2.5 rounded-xl border ${
                i === 14 ? "bg-blue-600 text-white font-bold border-blue-600" : "bg-white border-slate-200/60"
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}