'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Clock, 
  Video, 
  Users, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  Bell, 
  Menu, 
  X 
} from 'lucide-react';

export default function DoctorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/doctors/dashboard', icon: LayoutDashboard },
    { name: 'Telehealth Room', href: '/dashboard/telehealth', icon: Video },
    { name: 'Schedule Manager', href: '/doctors/dashboard', icon: Clock },
    { name: 'Settings', href: '/doctors/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 
        flex flex-col justify-between transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Top Brand / Logo Area */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">SWIFT MD PORTAL</span>
            <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
              Doctor Workspace
            </h1>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="p-4 space-y-1.5 flex-1 overflow-y-auto">
          <p className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Clinical Menu</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Sidebar Footer / Logout */}
        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-black text-xs">
                DR
              </div>
              <div>
                <p className="text-xs font-black text-white">Dr. Ivan Weru</p>
                <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Online
                </p>
              </div>
            </div>
          </div>
          <Link
            href="/login"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 text-xs font-bold transition border border-slate-700 hover:border-rose-500/20"
          >
            <LogOut size={16} /> Sign Out
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Bar */}
        <header className="h-20 bg-slate-900 border-b border-slate-800 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800 border border-slate-700"
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:block">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Practice Environment</span>
              <p className="text-xs font-bold text-slate-200">Welcome back, Dr. Weru</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition border border-slate-700 relative">
              <Bell size={18} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-blue-500"></span>
            </button>
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-md shadow-blue-600/30">
                IW
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

    </div>
  );
}