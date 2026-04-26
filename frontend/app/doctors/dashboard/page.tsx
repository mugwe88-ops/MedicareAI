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
      if (Array.isArray(data)) {
        setAppointments(data);
      }
    } catch (err) {
      console.error("Error fetching patient data:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'completed': return 'text-green-600 bg-green-50 border-green-100';
      default: return 'text-blue-600 bg-blue-50 border-blue-100';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">M</div>
          <span className="text-xl font-black text-slate-900">MedicareAI <span className="text-blue-600">Pro</span></span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900">Dr. Sarah Johnson</p>
            <p className="text-xs text-slate-500 font-medium">Cardiology Specialist</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" alt="doctor" />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-8">
        <header className="mb-10">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Patient Schedule</h2>
          <p className="text-slate-500 font-medium mt-1">Review and manage your daily appointments</p>
        </header>

        {/* Appointment Table */}
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-wider">Patient Details</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-wider">Time & Date</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-wider">Reason</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="p-20 text-center text-slate-400 font-bold italic">Loading records...</td></tr>
              ) : appointments.length > 0 ? (
                appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <p className="font-bold text-slate-900">{apt.patient_name}</p>
                      <p className="text-xs text-slate-400 font-medium">{apt.phone}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-bold text-slate-700 text-sm">
                        {new Date(apt.appointment_time).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                      </p>
                      <p className="text-xs text-blue-500 font-black uppercase">
                        {new Date(apt.appointment_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm text-slate-600 font-medium max-w-[200px] truncate">{apt.reason}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${getStatusColor(apt.status)}`}>
                        {apt.status || 'Scheduled'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="text-xs font-black text-blue-600 hover:underline uppercase tracking-widest">View Charts</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="p-20 text-center text-slate-400 font-bold italic">No patients scheduled for today.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}