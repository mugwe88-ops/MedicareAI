"use client";
import { useState, useEffect } from "react";

interface Appointment {
  id: number;
  patient_name: string;
  phone: string;
  appointment_time: string;
  status: string;
  reason: string;
}

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

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
    setActionLoading(id);
    try {
      const res = await fetch(`https://medicareai-1.onrender.com/api/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchAppointments();
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this appointment record?")) return;
    setActionLoading(id);
    try {
      const res = await fetch(`https://medicareai-1.onrender.com/api/appointments/${id}`, {
        method: "DELETE"
      });
      if (res.ok) setAppointments(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      alert("Delete failed");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Swift MD Nav */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-40">
        <h1 className="text-2xl font-black text-blue-600 tracking-tight">Swift MD <span className="text-slate-900 font-light">Pro</span></h1>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-black text-slate-900 leading-none">Dr. Sarah Johnson</p>
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">Administrator</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-200">SJ</div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-8">
        <div className="mb-10">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Clinical Overview</h2>
          <p className="text-slate-500 font-bold mt-2">Managing {appointments.length} active patients</p>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Patient</th>
                <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Schedule</th>
                <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Reason</th>
                <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-10 py-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="py-20 text-center font-black text-slate-300 italic text-xl">Loading records...</td></tr>
              ) : appointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-10 py-6">
                    <p className="font-black text-slate-900 text-lg leading-tight">{apt.patient_name}</p>
                    <p className="text-sm text-slate-400 font-bold mt-1">{apt.phone}</p>
                  </td>
                  <td className="px-10 py-6">
                    <p className="font-black text-slate-700">
                      {new Date(apt.appointment_time).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </p>
                    <p className="text-xs font-black text-blue-500 mt-0.5">
                      {new Date(apt.appointment_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </td>
                  <td className="px-10 py-6">
                    <p className="text-sm text-slate-500 font-bold italic">"{apt.reason}"</p>
                  </td>
                  <td className="px-10 py-6">
                    <span className={`px-4 py-1.5 text-[9px] font-black rounded-full uppercase tracking-widest border ${getStatusStyles(apt.status)}`}>
                      {apt.status || 'Scheduled'}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleStatusUpdate(apt.id, 'completed')}
                        className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                        title="Mark Completed"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(apt.id)}
                        className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                        title="Delete Record"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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