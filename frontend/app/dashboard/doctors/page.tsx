"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Appointment {
  id: number;
  patient_name: string;
  phone: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  reason: string;
}

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctorName, setDoctorName] = useState<string>("Doctor");
  const router = useRouter();

  const API_BASE = "https://medicareai-1.onrender.com";

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token) {
      router.push("/login");
      return;
    }

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.name) setDoctorName(parsed.name);
      } catch (e) {
        console.error("Failed to parse local user profile", e);
      }
    }

    fetchAppointments(token);
  }, [router]);

  const fetchAppointments = async (authToken?: string) => {
    const token = authToken || localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/api/appointments/doctor`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401 || res.status === 403) {
        router.push("/login");
        return;
      }

      const data = await res.json();
      if (Array.isArray(data)) setAppointments(data);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/api/appointments/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setAppointments((prev) =>
          prev.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt))
        );
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to cancel this patient appointment?")) return;
    handleStatusUpdate(id, "cancelled");
  };

  const formatDisplayDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return isNaN(date.getTime())
      ? dateStr
      : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const formatDisplayTime = (timeStr?: string) => {
    if (!timeStr) return "N/A";
    const [hours, minutes] = timeStr.split(":");
    if (!hours || !minutes) return timeStr;
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const formattedHours = h % 12 || 12;
    return `${formattedHours}:${minutes} ${ampm}`;
  };

  const getStatusStyles = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "completed":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "cancelled":
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  const getInitials = (name: string) => {
    return name
      .replace(/^dr\.\s*/i, "")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-40">
        <h1 className="text-2xl font-black text-blue-600 tracking-tighter">
          MedicareAI <span className="text-slate-900 font-light italic">Pro</span>
        </h1>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-black text-slate-900 leading-none">{doctorName}</p>
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">
              Medical Specialist
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-black shadow-lg shadow-blue-100">
            {getInitials(doctorName)}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-8">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
              Patient Appointments
            </h2>
            <p className="text-slate-500 font-bold mt-2">
              Assigned Records: {appointments.length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr className="border-b border-slate-100">
                <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Patient Profile
                </th>
                <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Visit Timing
                </th>
                <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Medical Reason
                </th>
                <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Status
                </th>
                <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">
                  Clinical Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center font-black text-slate-300 italic text-xl">
                    Accessing secure records...
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center font-bold text-slate-400 text-base">
                    No appointments assigned to your schedule.
                  </td>
                </tr>
              ) : (
                appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-blue-50/30 transition-all group">
                    <td className="px-10 py-7">
                      <p className="font-black text-slate-900 text-lg leading-tight">
                        {apt.patient_name || "Anonymous Patient"}
                      </p>
                      <p className="text-sm text-slate-400 font-bold mt-1 tracking-tight">
                        {apt.phone || "No phone listed"}
                      </p>
                    </td>
                    <td className="px-10 py-7">
                      <p className="font-black text-slate-700">
                        {formatDisplayDate(apt.appointment_date)}
                      </p>
                      <p className="text-xs font-black text-blue-500 uppercase mt-0.5">
                        {formatDisplayTime(apt.appointment_time)}
                      </p>
                    </td>
                    <td className="px-10 py-7">
                      <div className="px-4 py-2 bg-slate-100 rounded-xl inline-block">
                        <p className="text-xs text-slate-500 font-black italic uppercase tracking-tighter">
                          "{apt.reason || "General Consultation"}"
                        </p>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <span
                        className={`px-4 py-1.5 text-[9px] font-black rounded-full uppercase tracking-widest border ${getStatusStyles(
                          apt.status
                        )}`}
                      >
                        {apt.status || "Scheduled"}
                      </span>
                    </td>
                    <td className="px-10 py-7 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        <button
                          onClick={() => handleStatusUpdate(apt.id, "completed")}
                          className="h-11 w-11 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                          title="Complete Visit"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(apt.id)}
                          className="h-11 w-11 flex items-center justify-center bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                          title="Cancel Appointment"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}