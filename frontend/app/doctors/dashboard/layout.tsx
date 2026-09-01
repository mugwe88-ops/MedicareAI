"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  MessageSquare, 
  DollarSign, 
  BookOpen, 
  Settings, 
  Bell,
  Menu,
  X
} from "lucide-react";

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/doctors/dashboard", icon: LayoutDashboard },
    { name: "Appointment Schedule", href: "/doctors/dashboard/schedule", icon: Calendar },
    { name: "Patient Records", href: "/doctors/dashboard/patients", icon: Users },
    { name: "Messaging Center", href: "/doctors/dashboard/messages", icon: MessageSquare },
    { name: "Earnings & Payments", href: "/doctors/dashboard/earnings", icon: DollarSign },
    { name: "Continuing Education", href: "/doctors/dashboard/resources", icon: BookOpen },
    { name: "Profile & Availability", href: "/doctors/dashboard/profile", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      
      {/* Mobile Top Navigation Bar */}
      <div className="md:hidden bg-[#0B132B] text-white px-4 py-3 flex items-center justify-between border-b border-gray-800 sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-300 hover:text-white bg-gray-800/80 rounded-xl transition cursor-pointer"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div>
            <span className="text-[10px] tracking-wider text-blue-400 font-semibold uppercase block">Swift MD</span>
            <h1 className="text-sm font-bold tracking-tight text-white">Doctor Workspace</h1>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="relative p-2 text-gray-300 hover:bg-gray-800 rounded-full transition cursor-pointer">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0.5 right-0.5 h-4 w-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">7</span>
          </button>
          <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow">
            PP
          </div>
        </div>
      </div>

      {/* Backdrop overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Sidebar Navigation (Desktop & Mobile Drawer) */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#0B132B] text-white flex flex-col justify-between shrink-0 transform transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}>
        <div>
          <div className="p-6 border-b border-gray-800">
            <span className="text-xs tracking-wider text-blue-400 font-semibold uppercase">Swift MD Portal</span>
            <h1 className="text-xl font-bold tracking-tight mt-1">Doctor Workspace</h1>
          </div>
          <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-140px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition text-xs ${
                    isActive 
                      ? "bg-blue-600 text-white shadow-md" 
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Doctor Profile Footer in Sidebar */}
        <div className="p-4 border-t border-gray-800 m-4 bg-gray-900/50 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
              PP
            </div>
            <div>
              <p className="text-xs font-bold text-white">Dr. PRESSY PHIDES</p>
              <span className="text-[10px] text-green-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse"></span> Online
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar (Desktop Only) */}
        <header className="hidden md:flex bg-white border-b border-gray-200 px-8 py-4 justify-between items-center shadow-sm">
          <div>
            <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Live Practice Environment</span>
            <h2 className="text-xl font-extrabold text-gray-900">Doctor Portal Workspace</h2>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition cursor-pointer">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0.5 right-0.5 h-4 w-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">7</span>
            </button>
            <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow">
              PP
            </div>
          </div>
        </header>

        {/* Dynamic Page Content Renders Here */}
        <main className="flex-1 flex flex-col p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}