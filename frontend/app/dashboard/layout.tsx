'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { name: "MY DASHBOARD", href: "/dashboard" },
    { name: "MY APPOINTMENTS", href: "/dashboard/appointments" },
    { name: "TELEHEALTH ROOM", href: "/dashboard/telehealth" },
    { name: "PHARMACY STORE", href: "/dashboard/pharmacy" },
    { name: "MEDICAL RECORDS", href: "/dashboard/records" },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white p-6 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* App Logo/Header */}
          <div className="mb-8 flex items-center gap-2">
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
        <div className="mt-auto">
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
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}