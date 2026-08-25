'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Calendar, 
  Video, 
  ShoppingBag, 
  FileText, 
  Bot, 
  Users, 
  Settings, 
  UserPlus, 
  LogOut,
  CreditCard,
  FlaskConical,
  AlertCircle
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed.role) {
          setUserRole(parsed.role.toLowerCase());
        }
      }
    } catch (e) {
      console.error("Failed to parse user role from storage", e);
    }
  }, []);

  // Base navigation items for patients
  const baseNavItems = [
    { name: "MY DASHBOARD", href: "/dashboard", icon: LayoutDashboard },
    { name: "MY APPOINTMENTS", href: "/dashboard/appointments", icon: Calendar },
    { name: "TELEHEALTH ROOM", href: "/dashboard/telehealth", icon: Video },
    { name: "AI SYMPTOM CHECKER", href: "/dashboard/ai-checker", icon: Bot },
    { name: "DOCTOR DIRECTORY", href: "/dashboard/doctors", icon: Users },
    { name: "PHARMACY STORE", href: "/dashboard/pharmacy", icon: ShoppingBag },
    { name: "MEDICAL RECORDS", href: "/dashboard/records", icon: FileText },
    { name: "LAB TESTS", href: "/dashboard/labs", icon: FlaskConical },
    { name: "BILLING & PAYMENTS", href: "/dashboard/billing", icon: CreditCard },
    { name: "ACCOUNT SETTINGS", href: "/dashboard/settings", icon: Settings },
  ];

  // If user is a doctor or admin, add management features
  const navItems = [...baseNavItems];
  if (userRole === "doctor" || userRole === "admin") {
    navItems.push({
      name: "MANAGE DOCTORS",
      href: "/dashboard/add-doctor",
      icon: UserPlus,
    });
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row overflow-x-hidden font-sans">
      
      {/* Mobile Header Bar */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-md shadow-blue-600/30">
            S
          </div>
          <span className="text-lg font-black tracking-wider text-slate-100">
            SWIFT MD
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-slate-300 p-2 focus:outline-none hover:text-white font-bold text-xs bg-slate-800 rounded-lg px-3 py-2"
        >
          {mobileMenuOpen ? "✕ Close" : "☰ Menu"}
        </button>
      </div>

      {/* Sidebar for Desktop & Mobile Toggle */}
      <aside
        className={`${
          mobileMenuOpen ? "block" : "hidden"
        } md:block w-full md:w-72 bg-slate-900 text-white p-6 border-r border-slate-800 flex flex-col justify-between shrink-0 z-10`}
      >
        <div>
          {/* App Logo/Header (Desktop) */}
          <div className="hidden md:flex mb-6 items-center gap-3">
            <div className="bg-blue-600 w-10 h-10 rounded-2xl flex items-center justify-center font-black text-base text-white shadow-lg shadow-blue-600/30">
              S
            </div>
            <div>
              <span className="text-xl font-black tracking-wider text-slate-100 block leading-none">
                SWIFT MD
              </span>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1 block">
                Healthcare Suite
              </span>
            </div>
          </div>

          {/* Emergency SOS Banner Button */}
          <div className="mb-6">
            <Link
              href="/dashboard/telehealth"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-400 rounded-2xl text-xs font-black uppercase tracking-wider transition shadow-lg shadow-rose-950/50 group"
            >
              <AlertCircle size={16} className="text-rose-500 animate-pulse" />
              <span>Emergency SOS</span>
            </Link>
          </div>

          {/* Dynamic Navigation Map */}
          <nav className="space-y-1.5 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                  }`}
                >
                  <IconComponent size={18} className={isActive ? "text-white" : "text-slate-400"} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout Action at Bottom */}
        <div className="mt-4 pt-4 border-t border-slate-800/80">
          <button 
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wide text-slate-400 hover:bg-rose-950/30 hover:text-rose-400 transition-all group"
          >
            <LogOut size={18} className="text-slate-400 group-hover:text-rose-400 transition-colors" />
            <span>LOGOUT</span>
          </button>
        </div>
      </aside>

      {/* Main Page Content Render Target */}
      <main className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}