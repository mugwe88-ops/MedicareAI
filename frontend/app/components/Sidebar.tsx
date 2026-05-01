"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, Users, FileText, Settings, LogOut } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Schedule", href: "/dashboard/appointments", icon: Calendar },
    { name: "Patients", href: "/dashboard/patients", icon: Users },
    { name: "Records", href: "/dashboard/data", icon: FileText },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <aside className="hidden md:flex w-72 bg-[#0F172A] text-slate-300 flex-col h-screen sticky top-0 shadow-2xl shrink-0">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-white font-black text-xl">S</span>
          </div>
          <span className="text-white font-black text-xl tracking-tighter">SWIFT MD</span>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${
                  isActive 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                    : "hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={20} className={isActive ? "text-white" : "text-slate-500 group-hover:text-blue-400"} />
                <span className="font-bold text-sm tracking-wide uppercase">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-8 border-t border-slate-800">
        <button className="flex items-center gap-4 text-slate-500 hover:text-red-400 transition-colors font-bold text-sm uppercase">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}