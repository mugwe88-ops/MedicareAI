import type { Metadata } from "next";
import Link from "next/link";
import { Search, Bell, Mail, LayoutDashboard, Calendar, Clock, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "MedicareAI - Patient Portal",
  description: "Advanced Health Management Architecture",
};

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200/80 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-white text-xl">
              M
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">MedicareAI</span>
          </div>

          <nav className="space-y-2">
            <Link
              href="/patient/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-blue-600 bg-blue-50 transition"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              href="/patient/book-appointment"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition"
            >
              <Calendar className="w-4 h-4" />
              Book Appointment
            </Link>
            <Link
              href="/patient/consultations"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition"
            >
              <Clock className="w-4 h-4" />
              Booked Consultations
            </Link>
            <Link
              href="/patient/records"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition"
            >
              <FileText className="w-4 h-4" />
              Medical Records
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center">
            P
          </div>
          <div>
            <p className="text-xs font-black text-slate-900">Patient</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Patient Portal</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area with Global Header */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Global Top Header Bar (Only Search Bar) */}
        <header className="bg-white border-b border-slate-200/80 px-8 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search appointments, health metrics, reports..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-xs font-bold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2.5 rounded-xl border border-slate-200/80 text-slate-600 hover:bg-slate-50 transition">
              <Bell className="w-4 h-4" />
            </button>
            <button className="p-2.5 rounded-xl border border-slate-200/80 text-slate-600 hover:bg-slate-50 transition">
              <Mail className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}