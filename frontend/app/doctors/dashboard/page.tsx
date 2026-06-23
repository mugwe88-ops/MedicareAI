'use client';

import { useState, useEffect } from 'react';
import { Calendar, Phone, FileText, CheckCircle, Clock, LogOut } from 'lucide-react';

interface Appointment {
  id: number;
  patient_name: string;
  phone: string;
  appointment_time: string;
  status: string;
  reason: string;
}

interface UserSession {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [currentDoctor, setCurrentDoctor] = useState<UserSession | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      console.warn('Session credentials absent, rolling back to login boundary...');
      window.location.replace('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser) as UserSession;
      if (parsedUser.role?.toLowerCase() !== 'doctor') {
        window.location.replace('/dashboard');
        return;
      }
      setCurrentDoctor(parsedUser);
      fetchDoctorAppointments(token);
    } catch (err) {
      console.error('Session validation crash:', err);
      window.location.replace('/login');
    }
  }, []);

  const fetchDoctorAppointments = async (authToken: string) => {
    try {
      const BACKEND_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://medicareai-1.onrender.com';
      const res = await fetch(`${BACKEND_BASE}/api/appointments/doctor`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken.trim()}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setAppointments(Array.isArray(data) ? data : []);
        setErrorMsg('');
      } else {
        setErrorMsg('Failed to pull appointment data records.');
      }
    } catch (err) {
      setErrorMsg('Network bridge connection failure.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.replace('/login');
  };

  const formatDoctorName = (name: string) => {
    if (!name) return '';
    return name.toLowerCase().startsWith('dr.') ? name : `Dr. ${name}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-500 tracking-wider uppercase">Assembling Clinical Matrix...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER WORKSPACE LAYER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Welcome, {currentDoctor ? formatDoctorName(currentDoctor.name) : 'Provider'}
            </h1>
            <p className="text-slate-400 text-sm mt-1">Provider Control Center Workspace</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-slate-900 hover:bg-red-950/40 border border-slate-800 hover:border-red-900/50 text-slate-400 hover:text-red-400 transition-all text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl"
          >
            <LogOut className="w-4 h-4" />
            Exit Panel
          </button>
        </div>
        
        {/* ERROR BOUNDARY CONTAINER */}
        {errorMsg && (
          <div className="p-4 bg-red-950/30 text-red-400 rounded-xl mb-6 text-sm font-semibold border border-red-900/40 shadow-lg shadow-red-950/20">
            ⚠️ {errorMsg}
          </div>
        )}
        
        {/* APPOINTMENTS DATA WRAPPER GRID */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 tracking-wide uppercase flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              Incoming Patient Schedule ({appointments.length})
            </h2>
          </div>

          {appointments.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Clock className="w-12 h-12 mx-auto text-slate-800 mb-3" />
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">No Pending Check-ins</p>
              <p className="text-xs text-slate-500 mt-1">Your confirmed virtual clinical queues will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase font-bold tracking-wider bg-slate-950/40">
                    <th className="p-4">Patient Profile</th>
                    <th className="p-4">Time Window</th>
                    <th className="p-4">Primary Complaint / Reason</th>
                    <th className="p-4">Status Flag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {appointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white">{apt.patient_name}</div>
                        <div className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" /> {apt.phone || 'No contact string'}
                        </div>
                      </td>
                      <td className="p-4 text-slate-300 font-medium">
                        {new Date(apt.appointment_time).toLocaleString([], {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </td>
                      <td className="p-4 text-slate-400 max-w-xs truncate">
                        <div className="flex items-start gap-1.5">
                          <FileText className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                          <span>{apt.reason || 'Routine general clinical triage assessment'}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
                          apt.status?.toLowerCase() === 'confirmed' 
                            ? 'bg-green-950/40 text-green-400 border border-green-900/40' 
                            : 'bg-amber-950/40 text-amber-400 border border-amber-900/40'
                        }`}>
                          <span className="w-1 h-1 rounded-full bg-current animate-pulse"></span>
                          {apt.status || 'Scheduled'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}