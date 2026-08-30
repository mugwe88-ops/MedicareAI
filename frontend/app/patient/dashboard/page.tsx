"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Video, FileText, Activity, HeartPulse, Clock, ArrowRight } from "lucide-react";

interface Appointment {
  id: number;
  doctor_name?: string;
  department?: string;
  appointment_date: string;
  appointment_time: string;
  reason?: string;
  status: string;
  medical_history?: string;
}

export default function PatientDashboard() {
  const [userName, setUserName] = useState("Patient");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile & Medical Summary States
  const [age, setAge] = useState("N/A");
  const [phone, setPhone] = useState("N/A");
  const [conditions, setConditions] = useState("None");
  const [allergies, setAllergies] = useState("None");
  const [surgeries, setSurgeries] = useState("None");

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetchPatientData(token);
  }, [router]);

  const parseMedicalHistory = (historyStr: string) => {
    if (!historyStr) return;
    try {
      const condMatch = historyStr.match(/Conditions:\s*([^|]+)/);
      if (condMatch && condMatch[1]) {
        const conds = condMatch[1].trim();
        if (conds) setConditions(conds);
      }

      const allergyMatch = historyStr.match(/Allergies:\s*([^|]+)/);
      if (allergyMatch && allergyMatch[1]) {
        const alg = allergyMatch[1].trim();
        if (alg) setAllergies(alg);
      }

      const surgMatch = historyStr.match(/Surgeries:\s*(.+)$/);
      if (surgMatch && surgMatch[1]) {
        const surg = surgMatch[1].trim();
        if (surg) setSurgeries(surg);
      }
    } catch (e) {
      console.error("Failed parsing medical history string", e);
    }
  };

  const fetchPatientData = async (token: string) => {
    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        "https://medicareai-1.onrender.com";

      // 1. Fetch User Profile
      const profileRes = await fetch(`${backendUrl}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData.name) setUserName(profileData.name);
        if (profileData.age !== undefined && profileData.age !== null) {
          setAge(profileData.age.toString());
        }
        if (profileData.phone) setPhone(profileData.phone);
        if (profileData.medical_history) {
          parseMedicalHistory(profileData.medical_history);
        }
      }

      // 2. Fetch Appointments
      const aptRes = await fetch(`${backendUrl}/api/my-appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (aptRes.ok) {
        const aptData = await aptRes.json();
        setAppointments(aptData);
      }
    } catch (err) {
      console.error("Failed loading patient dashboard data", err);
    } finally {
      setLoading(false);
    }
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
      return (
        <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider">
          Confirmed
        </span>
      );
    }
    if (s === "completed") {
      return (
        <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-wider">
          Completed
        </span>
      );
    }
    if (s === "cancelled" || s === "rejected") {
      return (
        <span className="px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-xs font-bold uppercase tracking-wider">
          {s}
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-xs font-bold uppercase tracking-wider">
        Pending
      </span>
    );
  };

  const upcomingAppointmentsCount = appointments.filter(
    (a) => a.status?.toLowerCase() === "confirmed" || a.status?.toLowerCase() === "pending"
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <main className="max-w-6xl mx-auto p-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">
              Welcome Back, {userName}
            </h2>
            <p className="text-slate-400 font-bold mt-1">
              Here is a summary of your health profile and recent visits.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-200">
              {getInitials(userName)}
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 leading-none">
                {userName}
              </p>
              <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">
                PATIENT
              </p>
            </div>
          </div>
        </div>

        {/* Patient Health Summary Card (Moved to Top) */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 mb-10">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <HeartPulse size={20} />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-lg">My Health Profile Summary</h3>
                <p className="text-xs text-slate-400 font-semibold">Your clinical overview shared with attending physicians</p>
              </div>
            </div>
            <button
              onClick={() => router.push("/patient/dashboard/medical-records")}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition flex items-center gap-1.5"
            >
              View Records <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1">Demographics</p>
              <p className="text-sm font-bold text-slate-800">Age: <span className="font-normal">{age}</span></p>
              <p className="text-sm font-bold text-slate-800 mt-1">Phone: <span className="font-normal">{phone}</span></p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1">Chronic Conditions</p>
              <p className="text-sm font-bold text-slate-800">{conditions}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1">Allergies & Surgeries</p>
              <p className="text-xs font-bold text-slate-800">Allergies: <span className="font-normal text-rose-600">{allergies}</span></p>
              <p className="text-xs font-bold text-slate-800 mt-1">Surgeries: <span className="font-normal">{surgeries}</span></p>
            </div>
          </div>
        </div>

        {/* Quick Action Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div
            onClick={() => router.push("/patient/dashboard/appointments")}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md cursor-pointer transition group flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
              <Calendar size={22} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Schedule Visit</h3>
              <p className="text-slate-400 text-xs">Schedule new visit</p>
            </div>
          </div>

          <div
            onClick={() => router.push("/patient/dashboard/telehealth-room")}
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
            onClick={() => router.push("/patient/dashboard/medical-records")}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md cursor-pointer transition group flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition">
              <FileText size={22} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Patient Records</h3>
              <p className="text-slate-400 text-xs">View clinical files & history</p>
            </div>
          </div>
        </div>

        {/* Dashboard Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Upcoming Visits</p>
              <h4 className="text-3xl font-black text-slate-900 mt-1">{upcomingAppointmentsCount}</h4>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock size={22} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Records</p>
              <h4 className="text-3xl font-black text-slate-900 mt-1">{appointments.length}</h4>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Activity size={22} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account Status</p>
              <h4 className="text-lg font-black text-emerald-600 mt-2">Active & Verified</h4>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <HeartPulse size={22} />
            </div>
          </div>
        </div>

        {/* Consultations List */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-black text-slate-900 text-lg">
              Your Consultations
            </h3>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 font-bold">
              Loading records...
            </div>
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
                    <tr
                      key={apt.id}
                      className="hover:bg-slate-50/50 transition"
                    >
                      <td className="py-5 px-8">
                        <p className="font-bold text-slate-900">
                          {apt.doctor_name || "General Practitioner"}
                        </p>
                        <p className="text-xs text-slate-400 font-semibold">
                          {apt.department || "General Health"}
                        </p>
                      </td>
                      <td className="py-5 px-6">
                        <p className="font-bold text-slate-900">
                          {new Date(apt.appointment_date).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </p>
                        <p className="text-xs text-blue-600 font-bold">
                          {apt.appointment_time}
                        </p>
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
                          onClick={() =>
                            router.push(`/patient/dashboard/telehealth-room`)
                          }
                          className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition inline-flex items-center justify-center cursor-pointer"
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
