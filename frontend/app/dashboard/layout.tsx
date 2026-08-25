'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "MY DASHBOARD", href: "/dashboard" },
    { name: "MY APPOINTMENTS", href: "/dashboard/appointments" },
    { name: "TELEHEALTH ROOM", href: "/dashboard/telehealth" },
    { name: "PHARMACY STORE", href: "/dashboard/pharmacy" },
    { name: "MEDICAL RECORDS", href: "/dashboard/records" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row overflow-x-hidden">
      
      {/* Mobile Header Bar */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 w-8 h-8 rounded flex items-center justify-center font-bold text-sm text-white">
            S
          </div>
          <span className="text-lg font-bold tracking-wider text-slate-100">
            SWIFT MD
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-slate-300 p-2 focus:outline-none hover:text-white"
        >
          {mobileMenuOpen ? "✕ Close" : "☰ Menu"}
        </button>
      </div>

      {/* Sidebar for Desktop & Mobile Toggle */}
      <aside
        className={`${
          mobileMenuOpen ? "block" : "hidden"
        } md:block w-full md:w-64 bg-slate-900 text-white p-6 border-r border-slate-800 flex flex-col justify-between shrink-0 z-10`}
      >
        <div>
          {/* App Logo/Header (Desktop) */}
          <div className="hidden md:flex mb-8 items-center gap-2">
            <div className="bg-blue-600 w-8 h-8 rounded flex items-center justify-center font-bold text-sm text-white">
              S
            </div>
            <span className="text-xl font-bold tracking-wider text-slate-100">
              SWIFT MD
            </span>
          </div>

          {/* Dynamic Navigation Map */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout Action at Bottom */}
        <div className="mt-8 md:mt-auto">
          <button 
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
            className="w-full flex items-center px-4 py-3 rounded-lg text-xs font-semibold tracking-wide text-slate-400 hover:bg-red-950/30 hover:text-red-400 transition-all"
          >
            LOGOUT
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