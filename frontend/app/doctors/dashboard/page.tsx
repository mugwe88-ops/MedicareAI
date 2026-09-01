"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, Calendar, BarChart3, Users, FileText, HelpCircle, 
  Search, Bell, Mail, LogOut, MessageSquare, DollarSign, Award, Settings 
} from "lucide-react";

interface PatientRecord {
  id: string;
  testName: string;
  referredBy: string;
  date: string;
  comments: string;
  status: "Normal" | "Pending" | "Review Required" | "Hepatitis";
}

interface Appointment {
  id: string;
  patientName: string;
  specialty: string;
  time: string;
}

export default function DoctorDashboardPage() {
  const router = useRouter();
  const [doctorName, setDoctorName] = useState("Dr. PRESSY PHIDES");
  const [activeTab, setActiveTab] = useState<string>("Dashboard");
  const [activeSubTab, setActiveSubTab] = useState<"Lab Reports" | "Prescription" | "Medication" | "Diagnosis">("Lab Reports");
  
  const [labRecords] = useState<PatientRecord[]>([
    { id: "1", testName: "Electrocardiography", referredBy: "Dr. Rafiqul Islam", date: "28 Jan, 2024", comments: "Good! Take rest", status: "Normal" },
    { id: "2", testName: "Liver biopsy", referredBy: "Dr. Fahim Ahmed", date: "12 Jan, 2024", comments: "Waiting for diagram", status: "Pending" },
    { id: "3", testName: "Blood Test", referredBy: "Dr. Asad Khan", date: "10 Jan, 2024", comments: "As needed", status: "Normal" },
    { id: "4", testName: "Esophageal pH test", referredBy: "Dr. Shahid Ali", date: "24 Dec, 2023", comments: "Good", status: "Hepatitis" }
  ]);

  const [appointments] = useState<Appointment[]>([
    { id: "1", patientName: "Dr. Friedric Ziccardi", specialty: "Cardiologist", time: "17:00" },
    { id: "2", patientName: "Dr. Abagael Bitsul", specialty: "Medicine", time: "20:00" }
  ]);

  useEffect(() => {
    const name = localStorage.getItem("doctorName") || localStorage.getItem("userName");
    if (name) setDoctorName(name);
  }, []);

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Appointment Schedule", icon: Calendar },
    { name: "Patient Records", icon: Users },
    { name: "Messaging Center", icon: MessageSquare },
    { name: "Earnings & Payments", icon: DollarSign },
    { name: "Continuing Education", icon: Award },
    { name: "Profile & Availability", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row font-sans w-full">
      
      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className="w-full lg:w-64 bg-slate-900 text-slate-400 p-6 flex flex-col justify-between shrink-0 min-h-screen">
        <div className="space-y-8">
          {/* Brand Header */}
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">SWIFT MD PORTAL</span>
            <h2 className="text-white font-black text-lg tracking-tight">Doctor Workspace</h2>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.name;
              return (
                <button 
                  key={item.name}
                  onClick={() => setActiveTab(item.name)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition cursor-pointer ${
                    isActive ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <IconComponent size={18} /> {item.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Doctor Mini User Profile at Bottom of Sidebar */}
        <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow">
              {doctorName.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <h4 className="text-white text-xs font-black truncate max-w-[110px]">{doctorName}</h4>
              <p className="text-[10px] text-emerald-400 font-bold uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Online
              </p>
            </div>
          </div>
          <button 
            onClick={() => {
              localStorage.clear();
              router.push("/login");
            }}
            className="text-slate-500 hover:text-rose-400 transition cursor-pointer"
            title="Log Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col p-6 lg:p-8 space-y-6 overflow-y-auto bg-slate-50">
        
        {/* TOP SEARCH & NOTIFICATION BAR */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white px-6 py-4 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search patients, invoice, appointments etc..."
              className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pl-11 pr-4 py-3 text-xs font-medium text-slate-800 outline-none focus:border-blue-600 transition"
            />
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button className="w-10 h-10 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center transition shadow-sm cursor-pointer relative">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full"></span>
            </button>
            <button className="w-10 h-10 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center transition shadow-sm cursor-pointer">
              <Mail size={18} />
            </button>
          </div>
        </header>

        {/* DASHBOARD GRID CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT 2 COLUMNS */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* TOP ROW: Overall Performance & Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Overall Performance Card */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-black">Overall Performance</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold">
                    ↗ 95%
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center py-4">
                  <div className="relative h-36 w-36 rounded-full border-8 border-slate-100 border-t-blue-600 flex flex-col items-center justify-center text-center shadow-inner">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Avg Health Score</span>
                    <span className="text-3xl font-black text-slate-900 mt-0.5">468</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-4 text-center">
                    Martha Smith is healthier than <strong className="text-slate-900 font-bold">95%</strong> people
                  </p>
                </div>

                <button 
                  onClick={() => alert("Opening full health diagnostic report...")}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl transition shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  Check Full Report
                </button>
              </div>

              {/* Analytics Chart Widget */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-black">Analytics</span>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">Weekly ▾</span>
                </div>

                {/* Vitals Quick Pills */}
                <div className="flex items-center gap-2 overflow-x-auto py-2">
                  <span className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-[11px] font-bold shrink-0">Heart Rate</span>
                  <span className="px-3 py-1.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-xl text-[11px] font-bold shrink-0">Blood Pressure</span>
                  <span className="px-3 py-1.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-xl text-[11px] font-bold shrink-0">Glucose</span>
                </div>

                {/* Simulated Chart Bars */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-end justify-between gap-2 h-28 pt-4 px-2 border-b border-dashed border-slate-200">
                    <div className="w-8 bg-blue-100 rounded-t-xl h-12"></div>
                    <div className="w-8 bg-blue-200 rounded-t-xl h-20"></div>
                    <div className="w-8 bg-blue-100 rounded-t-xl h-14"></div>
                    <div className="w-8 bg-blue-600 rounded-t-xl h-24 relative flex flex-col items-center">
                      <span className="absolute -top-6 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">167 bpm</span>
                    </div>
                    <div className="w-8 bg-blue-100 rounded-t-xl h-16"></div>
                    <div className="w-8 bg-blue-50 rounded-t-xl h-10"></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold px-1">
                    <span>Sat</span><span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span>
                  </div>
                </div>
              </div>

            </div>

            {/* BOTTOM ROW: Lab Reports & Records Table */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5">
              
              {/* Sub-tabs selector */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3 overflow-x-auto">
                  {(["Lab Reports", "Prescription", "Medication", "Diagnosis"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveSubTab(tab)}
                      className={`text-xs font-black transition cursor-pointer pb-1 whitespace-nowrap ${
                        activeSubTab === tab ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-400">Recent ▾</span>
              </div>

              {/* Table Data */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 font-black uppercase tracking-wider border-b border-slate-100">
                      <th className="pb-3 px-2">Test Name</th>
                      <th className="pb-3 px-2">Referred by</th>
                      <th className="pb-3 px-2">Date</th>
                      <th className="pb-3 px-2">Comments</th>
                      <th className="pb-3 px-2">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {labRecords.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-2 font-black text-slate-900">{rec.testName}</td>
                        <td className="py-3.5 px-2 text-slate-600 font-medium">{rec.referredBy}</td>
                        <td className="py-3.5 px-2 text-slate-500 font-medium">{rec.date}</td>
                        <td className="py-3.5 px-2 text-slate-700 font-bold">{rec.comments}</td>
                        <td className="py-3.5 px-2">
                          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                            rec.status === "Normal" ? "bg-emerald-100 text-emerald-700" :
                            rec.status === "Pending" ? "bg-amber-100 text-amber-700" :
                            "bg-purple-100 text-purple-700"
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

          </div>

          {/* RIGHT COLUMN: Active Patient Profile & Appointments */}
          <div className="space-y-6">
            
            {/* Profile Card */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-xs font-black uppercase tracking-wider text-slate-400">
                <span className="text-blue-600">Profile</span>
                <span className="text-slate-300">•</span>
                <span>History</span>
              </div>

              <div className="flex flex-col items-center text-center space-y-3 pt-2">
                <div className="w-24 h-24 rounded-3xl bg-slate-100 overflow-hidden shadow-inner border border-slate-200">
                  <img 
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80" 
                    alt="Martha Smith"
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Martha Smith</h3>
                  <p className="text-xs text-slate-400 font-bold">34 yrs old Male</p>
                </div>
              </div>

              <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs text-slate-600 font-medium">
                <p className="flex justify-between items-center"><span className="text-slate-400">Address:</span> <strong className="text-slate-900 text-right">7246, Woodland Rd, Waukesha, WI 53186</strong></p>
                <p className="flex justify-between items-center"><span className="text-slate-400">Cell:</span> <strong className="text-slate-900">+1 310-351-7774</strong></p>
                <p className="flex justify-between items-center"><span className="text-slate-400">Last Appointment:</span> <strong className="text-slate-900">24 Jan, 2024</strong></p>
              </div>
            </div>

            {/* Appointments List Widget */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Appointments</h3>
                <div className="flex items-center gap-1 text-slate-400 font-bold text-xs">
                  <span>‹</span><span>›</span>
                </div>
              </div>

              {/* Date Slider Pills */}
              <div className="grid grid-cols-5 gap-1.5 text-center">
                <div className="p-2 rounded-xl bg-slate-50 text-slate-400 text-[10px] font-bold">
                  <span>19</span><br/>Mon
                </div>
                <div className="p-2 rounded-xl bg-slate-50 text-slate-400 text-[10px] font-bold">
                  <span>20</span><br/>Mon
                </div>
                <div className="p-2 rounded-xl bg-blue-600 text-white text-[10px] font-black shadow-sm">
                  <span>21</span><br/>Sun
                </div>
                <div className="p-2 rounded-xl bg-slate-50 text-slate-400 text-[10px] font-bold">
                  <span>22</span><br/>Mon
                </div>
                <div className="p-2 rounded-xl bg-slate-50 text-slate-400 text-[10px] font-bold">
                  <span>23</span><br/>Tue
                </div>
              </div>

              {/* Scheduled items */}
              <div className="space-y-3 pt-2">
                {appointments.map((apt) => (
                  <div key={apt.id} className="p-3.5 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-slate-900 text-xs">{apt.patientName}</h4>
                      <p className="text-[10px] text-slate-400 font-bold">{apt.specialty}</p>
                    </div>
                    <span className="text-xs font-black text-slate-800">{apt.time}</span>
                  </div>
                ))}
              </div>

            </div>

          </div>

        </div>

      </main>
    </div>
  );
}