'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, User, ShieldCheck, Bell, Home, Stethoscope, Clock } from 'lucide-react';

export function PatientSidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/patient/dashboard', icon: Home },
    { name: 'Book Appointment', href: '/patient/book', icon: Calendar },
    { name: 'Consultations', href: '/patient/consultations', icon: Stethoscope },
    { name: 'Profile', href: '/patient/profile', icon: User },
  ];

  return (
    <aside className="w-full md:w-64 bg-[#080d1a] border-r border-slate-800/80 p-5 flex flex-col justify-between shrink-0 min-h-screen">
      <div className="space-y-6">
        {/* Brand */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-blue-500/20">
            S
          </div>
          <div>
            <h2 className="font-black text-white tracking-wide text-base">SWIFT MD</h2>
            <p className="text-[10px] text-blue-400 font-semibold tracking-widest uppercase">Healthcare Portal</p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800/90 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-950 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm shrink-0">
            SJ
          </div>
          <div className="overflow-hidden">
            <h3 className="text-xs font-bold text-white truncate">Sarah Jenkins</h3>
            <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> ID: <span className="font-mono text-slate-300">SMD-88219</span>
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </div>
                {item.name === 'Book Appointment' && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Upcoming Appointment Widget */}
      <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-800/40 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Upcoming Session
          </span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
        </div>
        <p className="text-xs font-bold text-white">Dr. Marcus Vance</p>
        <p className="text-[10px] text-slate-400">Today at 2:30 PM (Telehealth)</p>
      </div>
    </aside>
  );
}