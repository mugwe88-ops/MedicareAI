"use client";

import { useState, useEffect } from "react";
import { 
  Heart, Activity, TrendingUp, Calendar, FileText, 
  ArrowRight, ShieldCheck, User, LogOut, ArrowLeft, Search, Bell, Mail, RefreshCw, Clock, CheckCircle2 
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: "Upcoming" | "Completed" | "Cancelled";
}

interface MedicalRecordItem {
  id: string;
  testName: string;
  referredBy: string;
  date: string;
  comments: string;
  status: "Normal" | "Pending" | "Review Required";
}

export default function PatientDashboardPage() {
  const [userName, setUserName] = useState("Patient");
  const [activeTab, setActiveTab] = useState<"overview" | "appointments" | "records">("overview");
  const [appointments, setAppointments] = useState<Appointment[]>([
    { id: "APT-01", doctorName: "Dr. Friedric Ziccardi", specialty: "Cardiologist", date: "21 Jan, 2024", time: "17:00", status: "Upcoming" },
    { id: "APT-02", doctorName: "Dr. Abagael Bitsul", specialty: "General Practitioner", date: "22 Jan, 2024", time: "20:00", status: "Upcoming" }
  ]);
  const [records, setRecords] = useState<MedicalRecordItem[]>([
    { id: "REC-1", testName: "Electrocardiography", referredBy: "Dr. Rafiqul Islam", date: "20 Jan, 2024", comments: "Good! Take rest", status: "Normal" },
    { id: "REC-2", testName: "Liver Biopsy", referredBy: "Dr. Fahim Ahmed", date: "12 Jan, 2024", comments: "Waiting for diagram", status: "Pending" },
    { id: "REC-3", testName: "Blood Test", referredBy: "Dr. Asad Khan", date: "10 Jan, 2024", comments: "As needed", status: "Normal" }
  ]);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read URL query parameters on mount/change
  const tabParam = searchParams.get("tab");
  const specialtyParam = searchParams.get("specialty");

  useEffect(() => {
    const name = localStorage.getItem("userName");
    if (name) setUserName(name);

    // If URL specifies a tab or specialty, handle it smoothly without alerts
    if (tabParam === "appointments" || specialtyParam) {
      setActiveTab("appointments");
    }
  }, [tabParam, specialtyParam]);

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-900 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Top Header Search & Notifications Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-100 rounded-3xl p-5 sm:p-6 shadow-sm">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search appointments, health metrics, reports..."
              className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pl-11 pr-4 py-3 text-xs font-medium text-slate-800 outline-none focus:border-blue-600 transition"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3">
            <button className="h-11 w-11 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition border border-slate-200/80 shadow-sm cursor-pointer">
              <Bell size={18} />
            </button>
            <button className="h-11 w-11 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition border border-slate-200/80 shadow-sm cursor-pointer">
              <Mail size={18} />
            </button>
            <div className="h-10 px-3.5 rounded-2xl bg-blue-50 text-blue-700 font-bold text-xs flex items-center gap-2 border border-blue-100">
              <User size={14} /> {userName}
            </div>
          </div>
        </div>

        {/* Welcome Section & Navigation Action Buttons */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Welcome Back, {userName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Monitor your overall performance, active clinical records, and upcoming appointments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <ArrowLeft size={15} /> Back
            </button>
            <button 
              onClick={() => {
                localStorage.clear();
                router.push("/login");
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-700 rounded-2xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <LogOut size={15} /> Log Out
            </button>
          </div>
        </div>

        {/* Interactive Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === "overview" ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Dashboard Overview
          </button>
          <button
            onClick={() => setActiveTab("appointments")}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === "appointments" ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Appointments & Schedule
          </button>
          <button
            onClick={() => setActiveTab("records")}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeTab === "records" ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Lab Reports & History
          </button>
        </div>

        {/* Tab Content 1: Overview */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Columns: Overall Performance & Vitals Analytics */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Overall Performance Card */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-black">Overall Performance</span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-bold self-start sm:self-auto">
                    <TrendingUp size={14} /> 95%
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center py-4">
                  <div className="relative h-44 w-44 sm:h-52 sm:w-52 rounded-full border-8 border-slate-100 border-t-blue-600 flex flex-col items-center justify-center text-center shadow-inner">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900">468</span>
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider mt-1">Health Score</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium mt-6 text-center">
                    Patient is healthier than <strong className="text-slate-900">95%</strong> of people.
                  </p>
                </div>
              </div>

              {/* Analytics & Vitals Overview */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wide">Vitals Analytics</h3>
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl">Weekly</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-md flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Heart Rate</span>
                      <span className="text-lg font-black mt-1 block">72 bpm</span>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-rose-400">
                      <Heart size={20} />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Blood Pressure</span>
                      <span className="text-lg font-black text-slate-900 mt-1 block">120/80</span>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <Activity size={20} />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Glucose Level</span>
                      <span className="text-lg font-black text-slate-900 mt-1 block">98 mg/dL</span>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <ShieldCheck size={20} />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Profile Summary & Upcoming Appointments Widget */}
            <div className="space-y-6">
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-xs uppercase font-black tracking-wider text-slate-400">Profile Card</h3>
                <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
                  <div className="h-14 w-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-black text-lg">
                    {userName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">{userName}</h4>
                    <p className="text-xs text-slate-500 font-medium">Male • 34 yrs</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-slate-600 font-medium">
                  <p className="flex justify-between"><span>Phone:</span> <strong className="text-slate-900">+1 310-351-7774</strong></p>
                  <p className="flex justify-between"><span>Location:</span> <strong className="text-slate-900">Waukesha, WI</strong></p>
                  <p className="flex justify-between"><span>Last Visit:</span> <strong className="text-slate-900">24 Jan, 2024</strong></p>
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs uppercase font-black tracking-wider text-slate-400">Scheduled Visits</h3>
                  <button onClick={() => setActiveTab("appointments")} className="text-xs text-blue-600 font-bold hover:underline">View All</button>
                </div>
                <div className="space-y-3">
                  {appointments.map((apt) => (
                    <div key={apt.id} className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                      <div>
                        <h5 className="font-black text-slate-900 text-xs">{apt.doctorName}</h5>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">{apt.specialty} • {apt.date}</p>
                      </div>
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] font-black rounded-xl">
                        {apt.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab Content 2: Appointments */}
        {activeTab === "appointments" && (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-slate-900">Your Booked Consultations</h3>
                <p className="text-xs text-slate-400 mt-0.5">Manage and track your appointments with medical specialists.</p>
                {specialtyParam && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold border border-blue-100">
                    Filtering booking view for specialty: <span className="underline">{specialtyParam}</span>
                  </div>
                )}
              </div>
              <button 
                onClick={() => {
                  // Handle booking action smoothly (e.g. open booking modal or route)
                }}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-2xl transition shadow-md shadow-blue-500/20 cursor-pointer"
              >
                + Book New Appointment
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appointments.map((apt) => (
                <div key={apt.id} className="p-5 border border-slate-200/80 rounded-2xl bg-slate-50 flex flex-col justify-between space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">{apt.id}</span>
                      <h4 className="text-sm font-black text-slate-900 mt-0.5">{apt.doctorName}</h4>
                      <p className="text-xs text-slate-500 font-medium">{apt.specialty}</p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[10px] font-black uppercase">
                      {apt.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 text-xs font-bold text-slate-600">
                    <span className="flex items-center gap-1.5"><Calendar size={13} /> {apt.date}</span>
                    <span className="flex items-center gap-1.5"><Clock size={13} /> {apt.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content 3: Lab Reports & History */}
        {activeTab === "records" && (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-black text-slate-900">Medical Records & Lab Reports</h3>
              <p className="text-xs text-slate-400 mt-0.5">Comprehensive view of your diagnostic test results and physician comments.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-black uppercase tracking-wider">
                    <th className="pb-3 px-3">Test Name</th>
                    <th className="pb-3 px-3">Referred By</th>
                    <th className="pb-3 px-3">Date</th>
                    <th className="pb-3 px-3">Comments</th>
                    <th className="pb-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50 transition">
                      <td className="py-4 px-3 font-black text-slate-900">{rec.testName}</td>
                      <td className="py-4 px-3 text-slate-600 font-medium">{rec.referredBy}</td>
                      <td className="py-4 px-3 text-slate-600 font-medium">{rec.date}</td>
                      <td className="py-4 px-3 text-slate-600 font-semibold">{rec.comments}</td>
                      <td className="py-4 px-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          rec.status === "Normal" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                        }`}>
                          {rec.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer Quick Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200/80">
          <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5">
            <Calendar size={13} /> MedicareAI Portal System v2.4
          </span>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-1 px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold rounded-2xl transition cursor-pointer shadow-sm"
          >
            <RefreshCw size={13} /> Refresh Data
          </button>
        </div>

      </div>
    </div>
  );
}