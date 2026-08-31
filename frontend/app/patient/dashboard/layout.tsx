"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  LayoutDashboard, Calendar, Video, FileText, Activity, 
  HeartPulse, Search, Bell, Mail 
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState("Patient");

  useEffect(() => {
    const cachedName = localStorage.getItem("userName") || localStorage.getItem("patient_name");
    if (cachedName) {
      setUserName(cachedName);
    }
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isActive = (path: string) => pathname === path;

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex justify-center items-center p-0 md:p-6">
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
                className={`w-full flex items-center gap-3 px-4 py-3 font-bold rounded-2xl text-sm transition ${
                  isActive("/patient/dashboard") 
                    ? "bg-blue-50 text-blue-600" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <LayoutDashboard size={18} /> Dashboard
              </button>
              <button 
                onClick={() => router.push("/patient/dashboard/appointments")}
                className={`w-full flex items-center gap-3 px-4 py-3 font-bold rounded-2xl text-sm transition ${
                  isActive("/patient/dashboard/appointments") 
                    ? "bg-blue-50 text-blue-600" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Calendar size={18} /> Appointments
              </button>
              <button 
                onClick={() => router.push("/patient/dashboard/telehealth")}
                className={`w-full flex items-center gap-3 px-4 py-3 font-bold rounded-2xl text-sm transition ${
                  isActive("/patient/dashboard/telehealth") 
                    ? "bg-blue-50 text-blue-600" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Video size={18} /> Telehealth Room
              </button>
              <button 
                onClick={() => router.push("/patient/dashboard/medical-records")}
                className={`w-full flex items-center gap-3 px-4 py-3 font-bold rounded-2xl text-sm transition ${
                  isActive("/patient/dashboard/medical-records") 
                    ? "bg-blue-50 text-blue-600" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
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
                className="w-full bg-white border border-slate-200/85 shadow-sm rounded-2xl py-3 pl-11 pr-4 text-xs font-medium text-slate-800 outline-none focus:border-blue-600 transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex items-center gap-3 self-end md:self-auto">
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200/85 flex items-center justify-center text-slate-600 shadow-sm cursor-pointer hover:bg-slate-50 transition">
                <Bell size={18} />
              </div>
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200/85 flex items-center justify-center text-slate-600 shadow-sm cursor-pointer hover:bg-slate-50 transition">
                <Mail size={18} />
              </div>
            </div>
          </header>

          {/* Child Page Content Renders Here */}
          {children}
        </main>
      </div>
    </div>
  );
}