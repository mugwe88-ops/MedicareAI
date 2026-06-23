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
        setErrorMsg(''); // Clear any historical errors on successful fetch
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

  // Clean up duplicate "Dr. Dr." formatting if present in database payload
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