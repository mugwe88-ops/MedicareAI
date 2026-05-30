'use client';

import { useState, useEffect } from 'react';

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
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setAppointments(data || []);
      } else {
        setErrorMsg('Failed to pull appointment data records.');
      }
    } catch (err) {
      setErrorMsg('Network bridge connection failure.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (aptId: number) => {
    // Existing delete logic
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center animate-pulse">
          <p className="text-sm font-bold text-slate-500 tracking-wide uppercase">Assembling Clinical Matrix...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome, Dr. {currentDoctor?.name}</h1>
        <p className="text-slate-500 text-sm mt-1">Provider Control Center Workspace</p>
      </div>
      
      {errorMsg && <div className="p-4 bg-red-50 text-red-600 rounded-xl mb-4 text-sm font-semibold border border-red-100">{errorMsg}</div>}
      
      {/* Table grid render container matches here perfectly */}
    </div>
  );
}