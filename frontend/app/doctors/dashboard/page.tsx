'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DoctorDashboard from '@/src/components/DoctorDashboard';

export default function DoctorDashboardPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      router.replace('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role?.toLowerCase() !== 'doctor') {
        router.replace('/dashboard');
        return;
      }
      setIsAuthorized(true);
    } catch (err) {
      console.error('Session validation crash:', err);
      router.replace('/login');
    }
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-500 tracking-wider uppercase">
            Verifying Provider Access...
          </p>
        </div>
      </div>
    );
  }

  return <DoctorDashboard />;
}