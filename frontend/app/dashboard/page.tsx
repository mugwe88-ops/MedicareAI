"use client";
import { useState, useEffect } from "react";
import { 
  Users, CheckCircle2, Trash2, Search, Bell, Filter
} from "lucide-react";

export default function ClinicalConsole() {
  const [user, setUser] = useState<{ id: string; name: string; role: string } | null>(null);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch User Profile
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        const res = await fetch("https://medicareai-1.onrender.com/api/auth/me", {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        
        if (res.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }
        
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("Auth fetch failed:", err);
      }
    };
    fetchUser();
  }, []);

  // 2. Fetch Doctor-Specific Appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("https://medicareai-1.onrender.com/api/appointments", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setAppointments(data);
      } catch (err) {
        console.error("Failed to load appointments", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchAppointments();
  }, [user]);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
      {/* Top Header */}
      <header className="h-24 bg-white border-b border-slate-200 flex items-center justify-between px-12 sticky top-0 z-10">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search patients..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none"
          />
        </div>
        
        <div className="flex items-center space-x-8">
          <button className="relative p-2 text-slate-400 hover:text-blue-600 transition-colors">
            <Bell size={22} />
            <span className="absolute top-2 right-2 h-2 w-2 bg-rose-500 rounded-full border-2 border-white" />
          </button>
          <div className="h-10 w-px bg-slate-200" />
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-slate-900 leading-tight">
                {user ? user.name : "Loading..."}
              </p>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                {user ? user.role : ""}
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-blue-600 border-4 border-blue-50 flex items-center justify-center text-white font-black text-sm">
              {user ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : "..."}
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Body */}
      <div className="flex-1 overflow-y-auto p-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Clinical Console</h1>
              <p className="text-slate-500 font-semibold mt-2">
                You have <span className="text-blue-600">{appointments.length} appointments</span> scheduled.
              </p>
            </div>
            <button className="flex items-center space-x-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 shadow-sm">
              <Filter size={16} />
              <span>Filter Results</span>
            </button>
          </div>

          {/* Table with Dynamic Data */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200/60 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Patient Profile</th>
                  <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Visit Timing</th>
                  <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <tr><td colSpan={4} className="text-center py-10 text-slate-400 font-bold">Syncing Records...</td></tr>
                ) : appointments.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-10 text-slate-400 font-bold">No appointments found.</td></tr>
                ) : (
                  appointments.map((apt: any) => (
                    <tr key={apt.id} className="group hover:bg-blue-50/30 transition-all">
                      <td className="px-10 py-8">
                        <div className="flex items-center space-x-4">
                          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                            <Users size={18} />
                          </div>
                          <div>
                            <p className="font-black text-slate-900">{apt.patient_name || "Unknown Patient"}</p>
                            <p className="text-xs text-slate-400 font-bold">{apt.patient_phone || "No Phone"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <p className="font-bold text-slate-700 text-sm">{new Date(apt.date).toLocaleDateString()}</p>
                        <p className="text-blue-600 text-xs font-black mt-0.5">{apt.time}</p>
                      </td>
                      <td className="px-10 py-8">
                        <span className={`px-4 py-1.5 text-[10px] font-black rounded-full uppercase tracking-wider border ${
                          apt.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                        }`}>
                          {apt.status}
                        </span>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex justify-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-3 text-emerald-500 hover:bg-emerald-50 rounded-xl border border-transparent hover:border-emerald-100">
                            <CheckCircle2 size={18} />
                          </button>
                          <button className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-100">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}