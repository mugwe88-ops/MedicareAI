"use client";
import { useRouter, usePathname } from "next/navigation";

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const SidebarItem = ({ name, icon, path }: { name: string, icon: string, path: string }) => {
    const isActive = pathname === path;
    return (
      <button
        onClick={() => router.push(path)}
        className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 font-black ${
          isActive 
            ? "bg-blue-600 text-white shadow-xl shadow-blue-200" 
            : "text-slate-400 hover:bg-white hover:text-blue-600"
        }`}
      >
        <span className="text-xl">{icon}</span>
        <span className="text-sm tracking-tight uppercase">{name}</span>
      </button>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* FIXED SIDEBAR */}
      <aside className="w-80 bg-white border-r border-slate-100 p-8 flex flex-col gap-10 sticky top-0 h-screen">
        <div className="flex items-center gap-3 px-2">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl">S</div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter">Swift MD</h1>
        </div>
        <nav className="flex flex-col gap-2 flex-1">
          <SidebarItem name="Dashboard" icon="📊" path="/doctor/dashboard" />
          <SidebarItem name="Schedule" icon="📅" path="/doctor/schedule" />
          <SidebarItem name="Patients" icon="👤" path="/doctor/patients" />
          <SidebarItem name="Records" icon="📂" path="/doctor/records" />
          <SidebarItem name="Settings" icon="⚙️" path="/doctor/settings" />
        </nav>
        <button className="flex items-center gap-4 px-6 py-4 text-slate-400 font-black hover:text-red-500 rounded-2xl transition-all uppercase text-[10px] tracking-widest">
          <span>🚪</span><span>Sign Out</span>
        </button>
      </aside>

      {/* DYNAMIC CONTENT AREA */}
      <main className="flex-1 p-12 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}