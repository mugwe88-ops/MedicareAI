"use client";

import { Calendar, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EmptyState() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm my-2">
      <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 shadow-xs">
        <Calendar className="w-10 h-10" />
      </div>
      <h3 className="text-xl font-black text-slate-900 mb-1">You're all caught up!</h3>
      <p className="text-slate-500 max-w-sm text-xs font-medium mb-6">
        No upcoming appointments found matching your filters. Ready to schedule your next consultation?
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => router.push("/patient/dashboard/appointments/book")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-2xl shadow-md transition cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Book Appointment
        </button>
        <button
          onClick={() => router.push("/patient/dashboard/doctors")}
          className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs px-6 py-3 rounded-2xl border border-slate-200 transition cursor-pointer"
        >
          <Search className="w-4 h-4 text-slate-400" /> Find a Doctor
        </button>
      </div>
    </div>
  );
}