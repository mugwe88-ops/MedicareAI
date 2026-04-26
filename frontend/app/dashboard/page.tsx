"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

interface Appointment {
  id: number;
  patient_name: string;
  phone: string;
  appointment_time: string;
  status: string;
  reason: string;
}

export default function DoctorDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await fetch("https://medicareai-1.onrender.com/api/appointments");
      const data = await res.json();
      if (Array.isArray(data)) setAppointments(data);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`https://medicareai-1.onrender.com/api/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchAppointments();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to remove this patient record?")) return;
    try {
      const res = await fetch(`https://medicareai-1.onrender.com/api/appointments/${id}`, {
        method: "DELETE"
      });
      if (res.ok) setAppointments(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      alert("Delete failed");
    }
  };

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
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans">
      {/* --- SIDEBAR (Fixed Left) --- */}
      <aside className="w-80 bg-white border-r border-slate-100 p-8 flex flex-col gap-10 sticky top-0 h-screen z-50">
        <div className="flex items-center gap-3 px-2">
          <div className="w-12 h-12 bg-blue-600 rounded-[1.2rem] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-100">S</div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter">Swift MD</h1>
        </div>

        <nav className="flex flex-col gap-3 flex-1">
          <SidebarItem name="Dashboard" icon="📊" path="/doctor/dashboard" />
          <SidebarItem name="Schedule" icon="📅" path="/doctor/dashboard" /> {/* Pointing to dashboard for now */}
          <SidebarItem name="Patients" icon="👤" path="/doctor/dashboard" />
          <SidebarItem name="Records" icon="📂" path="/doctor/dashboard" />
          <SidebarItem name="Settings" icon="⚙️" path="/doctor/dashboard" />
        </nav>

        <button className="flex items-center gap-4 px-6 py-4 text-slate-400 font-black hover:text-red-500 rounded-2xl transition-all uppercase text-[10px] tracking-widest">
          <span>🚪</span>
          <span>Sign Out</span>
        </button>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 p-12">
        <header className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Clinical Console</h2>
            <p className="text-slate-400 font-bold mt-2 text-sm uppercase tracking-widest">Healthcare Reimagined • {appointments.length} Active</p>
          </div>
          
          <div className="flex items-center gap-4 bg-white p-3 pr-8 rounded-[2rem] border border-slate-100 shadow-sm">
             <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-black shadow-lg shadow-blue-100">SJ</div>
             <div>
               <p className="text-sm font-black text-slate-900 leading-none">Dr. Sarah Johnson</p>
               <p className="text-[10px] font-bold text-blue-500 uppercase mt-1 tracking-tighter">Chief Medical Officer</p>
             </div>
          </div>
        </header>

        {/* --- CLINICAL DATA TABLE --- */}
        <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-12 py-10 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Patient Profile</th>
                <th className="px-12 py-10 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Timing</th>
                <th className="px-12 py-10 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Diagnosis/Reason</th>
                <th className="px-12 py-10 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Status</th>
                <th className="px-12 py-10 text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="py-32 text-center font-black text-slate-200 italic text-2xl animate-pulse tracking-widest">FETCHING SECURE DATA...</td></tr>
              ) : appointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-blue-50/20 transition-all group">
                  <td className="px-12 py-8">
                    <p className="font-black text-slate-900 text-xl tracking-tight">{apt.patient_name}</p>
                    <p className="text-sm text-slate-400 font-bold mt-1 uppercase tracking-tighter">{apt.phone}</p>
                  </td>
                  <td className="px-12 py-8">
                    <p className="font-black text-slate-700">
                      {new Date(apt.appointment_time).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </p>
                    <p className="text-xs font-black text-blue-500 uppercase mt-1">
                      {new Date(apt.appointment_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </td>
                  <td className="px-12 py-8">
                    <div className="px-5 py-3 bg-[#F1F5F9] rounded-2xl inline-block border border-slate-100">
                      <p className="text-[11px] text-slate-500 font-black italic uppercase tracking-tight">"{apt.reason}"</p>
                    </div>
                  </td>
                  <td className="px-12 py-8">
                    <span className={`px-5 py-2 text-[10px] font-black rounded-full uppercase tracking-widest border shadow-sm ${
                      apt.status?.toLowerCase() === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {apt.status || 'Scheduled'}
                    </span>
                  </td>
                  <td className="px-12 py-8 text-right">
                    <div className="flex justify-end gap-4 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                      <button 
                        onClick={() => handleStatusUpdate(apt.id, 'completed')}
                        className="h-12 w-12 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-md active:scale-95"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(apt.id)}
                        className="h-12 w-12 flex items-center justify-center bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-md active:scale-95"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}