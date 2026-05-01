"use client";
import { useState, useEffect } from "react";
import { 
  LayoutDashboard, Calendar, Users, FileText, Settings, 
  LogOut, CheckCircle2, Trash2, Search, Bell, Filter
} from "lucide-react";

export default function ClinicalConsole() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch real appointments from your API on component mount
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments`);
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setAppointments(data);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  // 2. Define the handler that was missing in your screenshot
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Update local state so UI reflects the change immediately
        setAppointments((prev) =>
          prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
        );
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const sidebarItems = [
    { id: "dashboard", label: "DASHBOARD", icon: <LayoutDashboard size={20} /> },
    { id: "schedule", label: "SCHEDULE", icon: <Calendar size={20} /> },
    { id: "patients", label: "PATIENTS", icon: <Users size={20} /> },
    { id: "records", label: "RECORDS", icon: <FileText size={20} /> },
    { id: "settings", label: "SETTINGS", icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans">
      <aside className="w-72 bg-[#0F172A] text-white flex flex-col shadow-2xl z-20">
        <div className="p-10">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <div className="h-4 w-4 bg-white rounded-sm rotate-45" />
            </div>
            <h2 className="text-2xl font-black tracking-tighter text-white">Swift MD</h2>
          </div>
        </div>

        <nav className="flex-1 px-6 space-y-1.5">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl font-bold text-sm transition-all duration-200 ${
                activeTab === item.id 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" 
                : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              {item.icon}
              <span className="tracking-wide">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800/50">
          <button className="w-full flex items-center space-x-4 px-5 py-4 text-slate-400 hover:text-rose-400 font-bold transition-all rounded-2xl hover:bg-rose-500/10">
            <LogOut size={20} />
            <span className="tracking-wide">LOGOUT</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-24 bg-white border-b border-slate-200 flex items-center justify-between px-12 sticky top-0 z-10">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search patients..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent rounded-xl text-sm outline-none transition-all"
            />
          </div>
          
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-900 leading-tight">Dr. William Weru</p>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Medical Technologist</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-blue-600 border-4 border-blue-50 flex items-center justify-center text-white font-black text-sm shadow-sm">
                WW
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Clinical Console</h1>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200/60 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Patient Profile</th>
                    <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Visit Timing</th>
                    <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Medical Reason</th>
                    <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Status</th>
                    <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {appointments.map((app) => (
                    <tr key={app.id} className="group hover:bg-blue-50/30 transition-all">
                      <td className="px-10 py-8">
                        <div className="flex items-center space-x-4">
                          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                            <Users size={18} />
                          </div>
                          <div>
                            <p className="font-black text-slate-900">{app.patient_name || "Unknown Patient"}</p>
                            <p className="text-xs text-slate-400 font-bold">{app.patient_phone || "No Phone"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <p className="font-bold text-slate-700 text-sm">{app.appointment_date}</p>
                        <p className="text-blue-600 text-xs font-black mt-0.5">{app.appointment_time}</p>
                      </td>
                      <td className="px-10 py-8">
                        <span className="px-4 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-black rounded-full uppercase tracking-wider border border-slate-200/50">
                          {app.reason || "General Consultation"}
                        </span>
                      </td>
                      <td className="px-10 py-8">
                        {/* Corrected Tailwind conditional classes */}
                        <span className={`px-4 py-1.5 text-[10px] font-black rounded-full uppercase tracking-wider border ${
                          app.status === 'Completed' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                          : 'bg-orange-50 text-orange-600 border-orange-100'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex justify-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button 
                            onClick={() => handleUpdateStatus(app.id, 'Completed')} 
                            className="p-3 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all shadow-sm"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {loading && <div className="p-12 text-center text-slate-400 font-bold">Syncing Records...</div>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}