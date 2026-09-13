"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  LayoutDashboard, Calendar, CalendarCheck, FileText, 
  Search, Bell, Mail 
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

  const isActive = (path: string) => {
    if (path === "/patient/dashboard") {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex justify-center items-stretch p-0 md:p-4">
      <div className="w-full max-w-7xl bg-slate-50 md:rounded-3xl shadow-xl overflow-hidden border border-slate-200/80 flex flex-col md:flex-row min-h-screen md:min-h-[95vh]">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-full md:w-64 bg-white border-r border-slate-100 p-5 flex flex-col justify-between hidden md:flex shrink-0">
          <div className="space-y-6">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push("/")}>
              <div className="w-9 h-9 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <span className="text-white font-black text-lg">S</span>
              </div>
              <span className="text-slate-900 font-black text-lg tracking-tight">Swift MD</span>
            </div>

            {/* Nav Menu Items */}
            <nav className="space-y-1.5">
              <button 
                onClick={() => router.push("/patient/dashboard")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 font-bold rounded-2xl text-xs transition cursor-pointer ${
                  isActive("/patient/dashboard") 
                    ? "bg-blue-50 text-blue-600" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <LayoutDashboard size={16} /> Dashboard
              </button>

              <button 
                onClick={() => router.push("/patient/dashboard/appointments")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 font-bold rounded-2xl text-xs transition cursor-pointer ${
                  isActive("/patient/dashboard/appointments") 
                    ? "bg-blue-50 text-blue-600" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Calendar size={16} /> Book Appointment
              </button>

              <button 
                onClick={() => router.push("/patient/dashboard/consultations")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 font-bold rounded-2xl text-xs transition cursor-pointer ${
                  isActive("/patient/dashboard/consultations") 
                    ? "bg-blue-50 text-blue-600" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <CalendarCheck size={16} /> Booked Consultations
              </button>

              <button 
                onClick={() => router.push("/patient/dashboard/medical-records")}
                className={`w-full flex items-center gap-3 px-4 py-2.5 font-bold rounded-2xl text-xs transition cursor-pointer ${
                  isActive("/patient/dashboard/medical-records") 
                    ? "bg-blue-50 text-blue-600" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <FileText size={16} /> Medical Records
              </button>
            </nav>
          </div>

          {/* Sidebar Footer / User Info */}
          <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xs shrink-0">
              {getInitials(userName)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black text-slate-900 truncate">{userName}</p>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Patient Portal</p>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* STICKY TOP HEADER (Compact Single-Row Search Bar) */}
          <header className="sticky top-0 z-30 bg-slate-50/90 backdrop-blur-md border-b border-slate-200/60 px-4 md:px-6 py-3 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search appointments, health metrics, reports..."
                className="w-full bg-white border border-slate-200/90 rounded-full py-2 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button 
                aria-label="Notifications"
                className="w-9 h-9 rounded-full bg-white border border-slate-200/90 flex items-center justify-center text-slate-600 hover:bg-slate-100 shadow-2xs transition cursor-pointer"
              >
                <Bell size={16} />
              </button>
              <button 
                aria-label="Messages"
                className="w-9 h-9 rounded-full bg-white border border-slate-200/90 flex items-center justify-center text-slate-600 hover:bg-slate-100 shadow-2xs transition cursor-pointer"
              >
                <Mail size={16} />
              </button>
            </div>
          </header>

          {/* Child Page Content Container (Tight padding: pt-4 px-4 md:px-6) */}
          <main className="flex-1 p-4 md:p-6 space-y-4">
            {children}
          </main>
        </div>

      </div>
    </div>
  );
}