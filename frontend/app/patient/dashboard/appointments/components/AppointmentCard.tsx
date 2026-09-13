"use client";

import { Calendar, Clock, Video, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";

export interface Appointment {
  id: number;
  doctor_name?: string;
  department?: string;
  appointment_date: string;
  appointment_time: string;
  reason?: string;
  status: string;
  location_type?: "Telehealth" | "In-Person";
  meeting_url?: string;
}

interface AppointmentCardProps {
  apt: Appointment;
  onCancel?: (id: number) => void;
}

export default function AppointmentCard({ apt, onCancel }: AppointmentCardProps) {
  const router = useRouter();
  const isVideo = apt.location_type === "Telehealth";
  const statusLower = (apt.status || "pending").toLowerCase();

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4">
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-600 font-black text-base shrink-0">
            {apt.doctor_name ? apt.doctor_name.replace("Dr. ", "").charAt(0) : "D"}
          </div>
          <div>
            <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">
              {apt.department || "General Medicine"}
            </span>
            <h4 className="text-base font-black text-slate-900 leading-snug">
              {apt.doctor_name || "General Practitioner"}
            </h4>
            <div className="mt-1">
              {statusLower === "confirmed" && (
                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase">Confirmed</span>
              )}
              {statusLower === "completed" && (
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase">Completed</span>
              )}
              {(statusLower === "cancelled" || statusLower === "rejected") && (
                <span className="px-2.5 py-0.5 bg-rose-50 text-rose-700 rounded-full text-[10px] font-black uppercase">{statusLower}</span>
              )}
              {statusLower === "pending" && (
                <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded-full text-[10px] font-black uppercase">Pending</span>
              )}
            </div>
          </div>
        </div>

        <div className="text-right text-xs text-slate-500 font-medium space-y-1 shrink-0">
          <div className="flex items-center justify-end gap-1 font-bold text-slate-800">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>
              {apt.appointment_date
                ? new Date(apt.appointment_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
                : "N/A"}
            </span>
          </div>
          <div className="flex items-center justify-end gap-1 text-[11px]">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{apt.appointment_time}</span>
          </div>
          <div className="flex items-center justify-end gap-1 text-[10px] font-bold">
            {isVideo ? <Video className="w-3 h-3 text-purple-600" /> : <MapPin className="w-3 h-3 text-slate-400" />}
            <span className={isVideo ? "text-purple-600" : "text-slate-500"}>{apt.location_type || "In-Person"}</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Reason for visit</p>
        <p className="text-xs font-semibold text-slate-700 italic">"{apt.reason || "General Checkup"}"</p>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          onClick={() => onCancel && onCancel(apt.id)}
          className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-2 rounded-xl transition cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={() => router.push(`/patient/dashboard/appointments/book?reschedule=${apt.id}`)}
          className="text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 px-3 py-2 rounded-xl transition cursor-pointer"
        >
          Reschedule
        </button>
        {isVideo && (
          <button
            onClick={() => router.push(apt.meeting_url || "/patient/dashboard/telehealth/room-1")}
            className="text-xs font-black bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Video className="w-3.5 h-3.5" /> Join Video
          </button>
        )}
      </div>
    </div>
  );
}