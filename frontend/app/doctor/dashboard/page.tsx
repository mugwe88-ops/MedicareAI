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

  const getStatusStyles = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter">Clinical Console</h2>
          <p className="text-slate-400 font-bold mt-1 uppercase text-xs tracking-widest">
            Status: {appointments.length} Patients Active
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-white/5 p-2 pr-6 rounded-full border border-white/10">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-black">SJ</div>
          <div className="text-left">
            <p className="text-xs font-black text-white leading-none">Dr. Sarah Johnson</p>
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter mt-1">Medical Director</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr className="border-b border-slate-100">
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Patient Profile</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Visit Timing</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Medical Reason</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Clinical Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={5} className="py-20 text-center font-black text-slate-300 italic">Syncing with Render DB...</td></tr>
            ) : appointments.length === 0 ? (
              <tr><td colSpan={5} className="py-20 text-center text-slate-400 font-bold">No active appointments found.</td></tr>
            ) : (
              appointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-blue-50/50 transition-all group">
                  <td className="px-8 py-6">
                    <p className="font-black text-slate-900 leading-tight">{apt.patient_name}</p>
                    <p className="text-xs text-slate-400 font-bold mt-1">{apt.phone}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-black text-slate-700 text-sm">
                      {new Date(apt.appointment_time).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                    <p className="text-[10px] font-black text-blue-500 uppercase mt-0.5">
                      {new Date(apt.appointment_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1.5 bg-slate-100 rounded-lg text-[10px] text-slate-500 font-black uppercase">
                      "{apt.reason}"
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 text-[9px] font-black rounded-full uppercase tracking-tighter border ${getStatusStyles(apt.status)}`}>
                      {apt.status || 'Pending'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleStatusUpdate(apt.id, 'completed')}
                        className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(apt.id)}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
  );
}