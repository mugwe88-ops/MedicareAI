"use client";
import { useState, useEffect } from "react";

// 1. Define the shape of your data
interface Appointment {
  id: number;
  patient_name: string;
  phone: string;
  appointment_time: string;
  status: string;
  reason: string;
}

export default function DoctorDashboard() {
  // 2. Explicitly tell the state it will hold an array of Appointments
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // UPDATED: Added ?doctor_id=2 to filter the request for this specific doctor
    fetch("https://medicareai-1.onrender.com/api/appointments?doctor_id=2")
      .then((res) => res.json())
      .then((data) => {
        // Now TypeScript knows 'data' matches 'Appointment[]'
        setAppointments(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={4} className="py-20 text-center font-black text-slate-300 italic text-xl">Loading records...</td></tr>
              ) : (
                appointments.map((apt) => (
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
                      <span className="px-4 py-1.5 text-[9px] font-black rounded-full uppercase tracking-widest border bg-amber-100 text-amber-700 border-amber-200">
                        {apt.status || 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}