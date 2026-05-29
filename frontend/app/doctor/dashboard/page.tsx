'use client';

import { useEffect, useState } from 'react';

export default function DoctorDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [doctor, setDoctor] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!token || !storedUser) {
      localStorage.clear();
      window.location.href = '/login';
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);

      // PROTECTION GUARD: If user is a patient, block access to medical records portal
      if (parsedUser.role !== 'doctor') {
        console.warn('Unauthorized access to clinical panel. Reverting to standard dashboard.');
        window.location.href = '/dashboard';
        return;
      }

      setDoctor(parsedUser);
      setLoading(false);
    } catch (err) {
      localStorage.clear();
      window.location.href = '/login';
    }
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500 font-medium animate-pulse">Loading Clinical Portal...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">Medical Portal: Dr. {doctor?.name}</h1>
        <p className="text-sm text-blue-600 font-semibold mt-1 capitalize">Specialist Field: {doctor?.specialization || 'General Practitioner'}</p>
      </div>
      {/* Rest of your active tele-consultation queue widgets go here */}
    </div>
  );
}