"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Video, Plus, Clock, ArrowLeft, LogOut } from "lucide-react";

interface Appointment {
  id: number;
  doctor_name?: string;
  department?: string;
  appointment_date: string;
  appointment_time: string;
  reason?: string;
  status: string;
}

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchAppointments(token);
  }, [router]);

  const fetchAppointments = async (token: string) => {
    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        "https://medicareai-1.onrender.com";

      const aptRes = await fetch(`${backendUrl}/api/my-appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (aptRes.ok) {
        const aptData = await aptRes.json();
        setAppointments(aptData);
      }
    } catch (err) {
      console.error("Failed loading appointments", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const getStatusBadge = (status: string) => {
    const s = status ? status.toLowerCase() : "pending";
    if (s === "confirmed") {
      return <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-bold uppercase">Confirmed</span>;
    }
    if (s === "completed") {
      return <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-xs font-bold uppercase">Completed</span>;
    }
    if (s === "cancelled" || s === "rejected") {
      return <span className="px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-xs font-bold uppercase">{s}</span>;
    }
    return <span className="px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-xs font-bold uppercase">Pending</span>;
  };

  return (
    <div className="space-y-6">
      {/* Top Actions Row: Back & Log Out */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-bold transition cursor-pointer"
        >
          <LogOut size={16} /> Log Out
        </button>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">My Appointments</h2>
          <p className="text-slate-400 font-bold text-xs mt-1">Manage and track your upcoming doctor consultations and telehealth sessions.</p>
        </div>
        <button
          onClick={() => router.push("/patient/dashboard/appointments/book")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-lg shadow-blue-500/30 transition flex items-center gap-2 cursor-pointer self-start"
        >
          <Plus size={16} /> Book New Appointment
        </button>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center">
          <h3 className="font-black text-slate-900 text-lg">Scheduled Visits</h3>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 font-bold">Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-medium">No appointments scheduled yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-8">Doctor / Dept</th>
                  <th className="py-4 px-6">Visit Timing</th>
                  <th className="py-4 px-6">Medical Reason</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-5 px-8">
                      <p className="font-bold text-slate-900">{apt.doctor_name || "General Practitioner"}</p>
                      <p className="text-xs text-slate-400 font-semibold">{apt.department || "General Health"}</p>
                    </td>
                    <td className="py-5 px-6">
                      <p className="font-bold text-slate-900">
                        {new Date(apt.appointment_date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-blue-600 font-bold">{apt.appointment_time}</p>
                    </td>
                    <td className="py-5 px-6">
                      <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg italic">
                        "{apt.reason || "General Checkup"}"
                      </span>
                    </td>
                    <td className="py-5 px-6">{getStatusBadge(apt.status)}</td>
                    <td className="py-5 px-8 text-right">
                      <button
                        onClick={() => router.push(`/patient/dashboard/telehealth/${apt.id}`)}
                        className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition inline-flex items-center justify-center cursor-pointer"
                        title="Join Telehealth Room"
                      >
                        <Video size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}