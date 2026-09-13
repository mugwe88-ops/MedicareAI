"use client";

import { Plus, PhoneCall, MapPin, Calendar as CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FloatingActions() {
  const router = useRouter();

  return (
    <div className="fixed bottom-8 right-8 flex flex-col items-end gap-2 group z-40">
      <div className="hidden group-hover:flex flex-col gap-2 transition-all duration-200 transform translate-y-1">
        <button
          onClick={() => router.push("/patient/dashboard/telehealth/emergency")}
          className="flex items-center gap-2.5 bg-white text-slate-800 text-xs font-extrabold px-4 py-3 rounded-2xl shadow-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition"
        >
          <PhoneCall className="w-4 h-4 text-rose-500" /> Emergency Consult
        </button>
        <button
          onClick={() => router.push("/patient/dashboard/clinics")}
          className="flex items-center gap-2.5 bg-white text-slate-800 text-xs font-extrabold px-4 py-3 rounded-2xl shadow-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition"
        >
          <MapPin className="w-4 h-4 text-emerald-500" /> Find Nearby Clinic
        </button>
        <button
          onClick={() => router.push("/patient/dashboard/appointments/book")}
          className="flex items-center gap-2.5 bg-white text-slate-800 text-xs font-extrabold px-4 py-3 rounded-2xl shadow-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition"
        >
          <CalendarIcon className="w-4 h-4 text-blue-500" /> Schedule Visit
        </button>
      </div>
      <button className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-transform duration-200 group-hover:rotate-45 cursor-pointer">
        <Plus className="w-7 h-7" />
      </button>
    </div>
  );
}