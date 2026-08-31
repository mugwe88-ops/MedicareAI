"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, Calendar, Video, FileText, Activity, 
  HeartPulse, Clock, ArrowRight, User, Settings, HelpCircle, Mail, Search, Bell 
} from "lucide-react";

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

    // Fallback: Check if name was pre-saved in localStorage during login
    const cachedName = localStorage.getItem("userName") || localStorage.getItem("patient_name");
    if (cachedName) {
      setUserName(cachedName);
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
        
        // Dynamically set user name from profile response
        const fetchedName = profileData.name || profileData.fullName || profileData.username;
        if (fetchedName) {
          setUserName(fetchedName);
          localStorage.setItem("userName", fetchedName);
        }

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

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex justify-center items-center p-0 md:p-6">
      {/* Main Dashboard Shell Container */}
      <div className="w-full max-w-7xl bg-slate-50 md:rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col md:flex-row min-h-[92vh]">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-full md:w-64 bg-white border-r border-slate-100 p-6 flex flex-col justify-between hidden md:flex">
          <div className="space-y-8">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push("/")}>
              <div className="w-9 h-9 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <span className="text-white font-black text-lg">M</span>
              </div>
              <span className="text-slate-900 font-black text-lg tracking-tight">MedicareAI</span>
            </div>

            {/* Nav Menu Items */}
            <nav className="space-y-2">
              <button 
                onClick={() => router.push("/patient/dashboard")}
                className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-600 font-bold rounded-2xl text-sm transition"
              >
                <LayoutDashboard size={18} /> Dashboard
              </button>
              <button 
                onClick={() => router.push("/patient/appointments")}
                className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-bold rounded-2xl text-sm transition"
              >
                <Calendar size={18} /> Appointments
              </button>
              <button 
                onClick={() => router.push("/patient/telehealth-room")}
                className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-bold rounded-2xl text-sm transition"
              >
                <Video size={18} /> Telehealth Room
              </button>
              <button 
                onClick={() => router.push("/patient/medical-records")}
                className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-bold rounded-2xl text-sm transition"
              >
                <FileText size={18} /> Medical Records
              </button>
            </nav>
          </div>

          {/* Sidebar Footer / User Info */}
          <div className="pt-6 border-t border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm">
              {getInitials(userName)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black text-slate-900 truncate">{userName}</p>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Patient Portal</p>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto max-h-[92vh]">
          
          {/* Top Search & Profile Header Bar */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search appointments, health metrics, reports..."
                className="w-full bg-white border border-slate-200/80 shadow-sm rounded-2xl py-3 pl-11 pr-4 text-xs font-medium text-slate-800 outline-none focus:border-blue-600 transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex items-center gap-3 self-end md:self-auto">
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-600 shadow-sm cursor-pointer hover:bg-slate-50 transition">
                <Bell size={18} />
              </div>
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-600 shadow-sm cursor-pointer hover:bg-slate-50 transition">
                <Mail size={18} />
              </div>
            </div>
          </header>

          {/* Welcome Banner Title */}
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Welcome Back, {userName}
            </h2>
            <p className="text-slate-400 font-bold text-xs mt-1">
              Here is a summary of your health profile and recent visits.
            </p>
          </div>

          {/* GRID LAYOUT: Center Analytics / Main Section & Right Profile Column */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT / MAIN COLUMN (Analytics & Health Summary) */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Analytics & Performance Widget */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Overall Performance Card */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Overall Performance</h3>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">↑ 95%</span>
                    </div>
                    <div className="flex items-center justify-center py-2">
                      <div className="relative w-32 h-16 border-t-8 border-l-8 border-r-8 border-blue-600 rounded-t-full flex items-end justify-center">
                        <span className="text-2xl font-black text-slate-900 mb-1">468</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-500">{userName} is healthier than 95% people</p>
                    <button 
                      onClick={() => router.push("/patient/medical-records")}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      Full Report
                    </button>
                  </div>
                </div>

                {/* Analytics Chart Summary */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Analytics</h3>
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">Weekly ⌄</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    <span className="px-3 py-1 bg-slate-900 text-white text-[11px] font-bold rounded-full">Heart Rate</span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-full">BP</span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-full">Glucose</span>
                  </div>
                  <div className="mt-4 flex items-end justify-between gap-2 h-20 pt-2 border-t border-slate-50 text-[10px] font-bold text-slate-400">
                    <div className="flex flex-col items-center gap-1"><div className="w-4 bg-blue-100 h-8 rounded-md"></div>Sat</div>
                    <div className="flex flex-col items-center gap-1"><div className="w-4 bg-blue-200 h-12 rounded-md"></div>Sun</div>
                    <div className="flex flex-col items-center gap-1"><div className="w-4 bg-blue-300 h-10 rounded-md"></div>Mon</div>
                    <div className="flex flex-col items-center gap-1"><div className="w-4 bg-blue-400 h-14 rounded-md"></div>Tue</div>
                    <div className="flex flex-col items-center gap-1"><div className="w-4 bg-blue-600 h-16 rounded-md shadow-lg shadow-blue-500/30"></div>Wed</div>
                    <div className="flex flex-col items-center gap-1"><div className="w-4 bg-blue-200 h-10 rounded-md"></div>Thu</div>
                  </div>
                </div>

              </div>

              {/* Patient Health Profile Summary Card */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
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
                    onClick={() => router.push("/patient/medical-records")}
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

              {/* Consultations List Table */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center">
                  <h3 className="font-black text-slate-900 text-lg">Your Consultations</h3>
                </div>

                {loading ? (
                  <div className="p-12 text-center text-slate-400 font-bold">Loading records...</div>
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
                                onClick={() => router.push(`/patient/telehealth-room`)}
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

            </div>

            {/* RIGHT COLUMN (Profile Card & Appointment Calendar Widget) */}
            <div className="space-y-8">
              
              {/* Profile Card Widget */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 text-center relative overflow-hidden">
                <div className="w-24 h-24 rounded-3xl bg-slate-100 mx-auto overflow-hidden shadow-md mb-4 flex items-center justify-center text-3xl">
                  <span>🧑‍⚕️</span>
                </div>
                <h3 className="text-base font-black text-slate-900">{userName}</h3>
                <p className="text-xs font-bold text-slate-400 mt-0.5">{age !== "N/A" ? `${age} yrs old` : "Patient"} • Verified</p>

                <div className="mt-6 pt-6 border-t border-slate-100 text-left space-y-3 text-xs font-medium text-slate-600">
                  <p className="truncate"><strong className="text-slate-900">Contact:</strong> {phone}</p>
                  <p className="truncate"><strong className="text-slate-900">Status:</strong> Verified Patient</p>
                </div>
              </div>

              {/* Appointments Interactive Widget */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-black text-slate-900 text-base">Appointments</h3>
                  <div className="flex gap-1 text-slate-400">
                    <button className="p-1 hover:text-slate-900">‹</button>
                    <button className="p-1 hover:text-slate-900">›</button>
                  </div>
                </div>

                {/* Calendar Days row snippet */}
                <div className="grid grid-cols-5 gap-2 text-center mb-6">
                  <div className="p-2 rounded-2xl bg-slate-50 text-slate-400 text-xs font-bold">
                    <p className="text-[10px]">19</p>
                    <p className="text-[9px] uppercase">Mon</p>
                  </div>
                  <div className="p-2 rounded-2xl bg-slate-50 text-slate-400 text-xs font-bold">
                    <p className="text-[10px]">20</p>
                    <p className="text-[9px] uppercase">Mon</p>
                  </div>
                  <div className="p-2 rounded-2xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/20">
                    <p className="text-[10px]">21</p>
                    <p className="text-[9px] uppercase">Sun</p>
                  </div>
                  <div className="p-2 rounded-2xl bg-slate-50 text-slate-400 text-xs font-bold">
                    <p className="text-[10px]">22</p>
                    <p className="text-[9px] uppercase">Mon</p>
                  </div>
                  <div className="p-2 rounded-2xl bg-slate-50 text-slate-400 text-xs font-bold">
                    <p className="text-[10px]">23</p>
                    <p className="text-[9px] uppercase">Tue</p>
                  </div>
                </div>

                {/* Upcoming Schedule Mini List */}
                <div className="space-y-4">
                  {appointments.slice(0, 2).map((apt, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-black text-slate-900">{apt.doctor_name || "Specialist Visit"}</p>
                        <p className="text-[10px] font-bold text-blue-600 mt-0.5">{apt.department || "General Health"}</p>
                      </div>
                      <span className="text-[11px] font-extrabold text-slate-500">{apt.appointment_time || "10:00"}</span>
                    </div>
                  ))}
                  {appointments.length === 0 && (
                    <p className="text-xs text-slate-400 font-medium text-center py-4">No upcoming scheduled visits.</p>
                  )}
                </div>
              </div>

            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
