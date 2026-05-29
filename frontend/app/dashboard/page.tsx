'use client';

import { useEffect, useState } from 'react';

export default function PatientDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!token || !storedUser) {
      console.warn('No active session found. Routing back to login.');
      localStorage.clear();
      window.location.href = '/login';
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      
      // PROTECTION GUARD: If user is logged in as a doctor, route them out of patient workspace
      if (parsedUser.role === 'doctor') {
        console.log('Doctor detected on patient route. Forwarding to professional panel...');
        window.location.href = '/doctor/dashboard';
        return;
      }

      setUser(parsedUser);
      setLoading(false);
    } catch (err) {
      localStorage.clear();
      window.location.href = '/login';
    }
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500 font-medium animate-pulse">Loading secure workspace panel...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name}</h1>
      <p className="text-slate-500 text-sm">Patient Clinical Dashboard System</p>
      {/* Rest of your patient dashboard layout widgets go here */}
    </div>
  );
}