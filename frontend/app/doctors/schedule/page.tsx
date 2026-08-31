"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar as CalendarIcon, Clock, User, Video, ShieldCheck } from "lucide-react";

interface Appointment {
  id: number;
  patient_name?: string;
  patient_email?: string;
  department?: string;
  appointment_date: string;
  appointment_time: string;
  reason?: string;
  status: string;
}

export default function DoctorSchedulePage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "https://medicareai-1.onrender.com";

  useEffect(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("jwt");
    if (!token) {
      router.push("/login");
      return;
    }

    // Fetch doctor appointments from backend
    fetch(`${API_BASE}/api/doctor/appointments`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load appointments");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setAppointments(data);
        }
      })
      .catch((err) => {
        console.error("Error loading doctor appointments:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router, API_BASE]);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Schedule & Booked Patients</h2>
          <p className="text-slate-400 font-bold text-xs mt-1">
            Manage your practice hours and review active patient bookings for consultations.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2.5 rounded-2xl text-xs font-bold shadow-sm">
          <CalendarIcon size={16} /> September 2026 Schedule
        </div>
      </div>

      {/* Booked Patients List Section */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center">
          <div>
            <h3 className="font-black text-slate-900 text-lg">Active Patient Bookings</h3>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">Patients who have scheduled consultations with you.</p>
          </div>
          <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-xl">
            {appointments.length} Total Booked
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 font-bold text-xs">Loading patient bookings...</div>
        ):(
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-8">Patient Name</th>
                  <th className="py-4 px-6">Scheduled Timing</th>
                  <th className="py-4 px-6">Medical Reason</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-medium text-xs">
                      No patient bookings found at this time.
                    </td>
                  </tr>
                ) : (
                  appointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-5 px-8">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-xs">
                            <User size={16} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{apt.patient_name || "Patient"}</p>
                            <p className="text-xs text-slate-400 font-semibold">{apt.patient_email || "Verified Patient"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <p className="font-bold text-slate-900 text-xs">
                          {new Date(apt.appointment_date).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-xs text-blue-600 font-bold mt-0.5">{apt.appointment_time}</p>
                      </td>
                      <td className="py-5 px-6">
                        <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg italic">
                          "{apt.reason || "General Checkup"}"
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <span className="px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-[10px] font-bold uppercase">
                          {apt.status || "Booked"}
                        </span>
                      </td>
                      <td className="py-5 px-8 text-right">
                        <button
                          onClick={() => router.push(`/doctors/dashboard/telehealth/${apt.id}`)}
                          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition inline-flex items-center gap-2 text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer"
                          title="Join Telehealth Room"
                        >
                          <Video size={14} /> Join Room
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}