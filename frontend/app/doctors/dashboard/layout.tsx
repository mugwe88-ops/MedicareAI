"use client";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Video, 
  Calendar, 
  Users, 
  MessageSquare, 
  DollarSign, 
  BookOpen, 
  Settings, 
  Bell
} from "lucide-react";

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/doctors/dashboard", icon: LayoutDashboard },
    { name: "Appointment Schedule", href: "/doctors/dashboard/schedule", icon: Calendar },
    { name: "Patient Records", href: "/doctors/dashboard/patients", icon: Users },
    { name: "Messaging Center", href: "/doctors/dashboard/messages", icon: MessageSquare },
    { name: "Earnings & Payments", href: "/doctors/dashboard/earnings", icon: DollarSign },
    { name: "Continuing Education", href: "/doctors/dashboard/resources", icon: BookOpen },
    { name: "Profile & Availability", href: "/doctors/dashboard/settings", icon: Settings },
    { name: "Telehealth Room", href: "/doctors/dashboard/telehealth", icon: Video },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#0B132B] text-white flex flex-col justify-between hidden md:flex shrink-0">
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
                <a
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition text-xs ${
                    isActive 
                      ? "bg-blue-600 text-white shadow-md" 
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.name}</span>
                </a>
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
        {/* Top Header Bar */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm">
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
        <main className="flex-1 flex flex-col p-8">
          {children}
        </main>
      </div>
    </div>
  );
}