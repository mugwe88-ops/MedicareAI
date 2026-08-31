"use client";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Video, 
  Calendar, 
  Settings, 
  Bell
} from "lucide-react";

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/doctors/dashboard", icon: LayoutDashboard },
    { name: "Telehealth Room", href: "/doctors/telehealth", icon: Video },
    { name: "Schedule Manager", href: "/doctors/schedule", icon: Calendar },
    { name: "Settings", href: "/doctors/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Navigation (Rendered Once) */}
      <aside className="w-64 bg-[#0B132B] text-white flex flex-col justify-between hidden md:flex shrink-0">
        <div>
          <div className="p-6 border-b border-gray-800">
            <span className="text-xs tracking-wider text-blue-400 font-semibold uppercase">Swift MD Portal</span>
            <h1 className="text-xl font-bold tracking-tight mt-1">Doctor Workspace</h1>
          </div>
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition ${
                    isActive 
                      ? "bg-blue-600 text-white shadow-md" 
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </a>
              );
            })}
          </nav>
        </div>

        {/* Doctor Profile Footer in Sidebar */}
        <div className="p-4 border-t border-gray-800 m-4 bg-gray-900/50 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white">
              PP
            </div>
            <div>
              <p className="text-sm font-bold text-white">Dr. PRESSY PHIDES</p>
              <span className="text-xs text-green-400 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span> Online
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar (Rendered Once) */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm">
          <div>
            <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Live Practice Environment</span>
            <h2 className="text-xl font-extrabold text-gray-900">Doctor Portal Workspace</h2>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition cursor-pointer">
              <Bell className="h-6 w-6" />
              <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center font-bold">7</span>
            </button>
            <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow">
              PP
            </div>
          </div>
        </header>

        {/* Dynamic Page Content Renders Here */}
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
