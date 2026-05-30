'use client';

import React from 'react';

export default function DoctorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Container wrapper ensuring smooth client-side hydration */}
      <main className="w-full h-full">{children}</main>
    </div>
  );
}