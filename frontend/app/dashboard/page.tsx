"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Video, FileText, LogOut } from "lucide-react";

interface Appointment {
  id: number;
  doctor_name?: string;
  department?: string;
  appointment_date: string;
  appointment_time: string;
  reason?: string;
  status: string;
}

export default function PatientDashboard() {
  const [userName, setUserName] = useState("Patient");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
        if (parsed.name) setUserName(parsed.name);
      } catch (e) {
        console.error("Failed parsing profile", e);
      }
    }

    fetchAppointments(token);
  }, [router]);

  const fetchAppointments = async (token: string) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://medicareai-backend.onrender.com";
      const res = await fetch(`${backendUrl}/api/my-appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusBadge = (status: string) => {
    const s = status ? status.toLowerCase() : "pending";
    if (s === "confirmed") {
      return <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider">Confirmed</span>;
    }
    if (s === "completed") {
      return <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-wider">Completed</span>;
    }
    if (s === "cancelled" || s === "rejected") {
      return <span className="px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-xs font-bold uppercase tracking-wider">{s}</span>;
    }
    return <span className="px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-xs font-bold uppercase tracking-wider">Pending</span>;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Top Header Bar */}
      <nav className="bg-white border-b border-slate-100 px-8 py-5 flex justify-between items-center sticky top-0 z-40">
        <h1 className="text-2xl font-black text-blue-600 tracking-tighter">
          SWIFT MD
        </h1>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-base font-black text-slate-900 leading-none">{userName}</p>
              <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">
                PATIENT
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-200">
              {getInitials(userName)}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-rose-600 transition"
            title="Log Out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      {/* Content Body */}
      <main className="max-w-6xl mx-auto p-8">
        <div className="mb-8">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">
            Welcome Back, {userName}
          </h2>
          <p className="text-slate-400 font-bold mt-1">
            Assigned Records: {appointments.length}
          </p>
        </div>

        {/* Quick Action Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div
            onClick={() => router.push("/appointments")}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md cursor-pointer transition group flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
              <Calendar size={22} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Book Appointment</h3>
              <p className="text-slate-400 text-xs">Schedule new visit</p>
            </div>
          </div>

          <div
            onClick={() => router.push("/telehealth")}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md cursor-pointer transition group flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition">
              <Video size={22} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Telehealth Portal</h3>
              <p className="text-slate-400 text-xs">Join virtual room</p>
            </div>
          </div>

          <div
            onClick={() => router.push("/records")}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md cursor-pointer transition group flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition">
              <FileText size={22} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Prescriptions</h3>
              <p className="text-slate-400 text-xs">View issued meds</p>
            </div>
          </div>
        </div>

        {/* Consultations List */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-black text-slate-900 text-lg">Your Consultations</h3>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 font-bold">Loading records...</div>
          ) : appointments.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-medium">
              No appointments scheduled yet.
            </div>
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
                            year: "numeric"
                          })}
                        </p>
                        <p className="text-xs text-blue-600 font-bold">{apt.appointment_time}</p>
                      </td>
                      <td className="py-5 px-6">
                        <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg italic">
                          "{apt.reason || "General Checkup"}"
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        {getStatusBadge(apt.status)}
                      </td>
                      <td className="py-5 px-8 text-right">
                        <button
                          onClick={() => router.push(`/telehealth/${apt.id}`)}
                          className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition inline-flex items-center justify-center"
                          title="Join Call"
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
      </main>
    </div>
  );
}