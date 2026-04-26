"use client";
import { useState, useEffect } from "react";

export default function PatientPortal() {
  const [userName, setUserName] = useState("Patient");

  // In a real app, you'd fetch the user's name from your backend or decoded token
  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) setUserName(storedName);
  }, []);

  const stats = [
    { label: "Upcoming Appointments", value: "2", icon: "📅", color: "bg-blue-100 text-blue-600" },
    { label: "Medical Records", value: "12", icon: "📁", color: "bg-green-100 text-green-600" },
    { label: "Active Prescriptions", value: "3", icon: "💊", color: "bg-purple-100 text-purple-600" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm">
        <h1 className="text-2xl font-black text-blue-600 tracking-tight">Swift MD</h1>
        <div className="flex items-center gap-4">
          <span className="text-slate-600 font-medium">Welcome, {userName}</span>
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
            {userName[0].toUpperCase()}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-8">
        <header className="mb-10">
          <h2 className="text-3xl font-bold text-slate-900">Patient Dashboard</h2>
          <p className="text-slate-500 mt-1 font-medium">Manage your health and book new consultations.</p>
        </header>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl ${stat.color} flex items-center justify-center text-2xl`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Action Area */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">Recent Appointments</h3>
                <button className="text-blue-600 font-bold text-sm hover:underline">Book New</button>
              </div>
              
              <div className="space-y-4">
                {/* Appointment Placeholder */}
                <div className="flex items-center justify-between p-4 border border-slate-50 rounded-2xl hover:bg-slate-50 transition">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold">DR</div>
                    <div>
                      <p className="font-bold text-slate-900">Dr. Sarah Johnson</p>
                      <p className="text-xs text-slate-500">General Consultation • April 28, 10:30 AM</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-black rounded-full uppercase">Pending</span>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-6">
            <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-200">
              <h3 className="text-xl font-bold mb-2">Need Help Fast?</h3>
              <p className="text-blue-100 text-sm mb-6 leading-relaxed">Connect with an on-call doctor in less than 5 minutes via video call.</p>
              <button className="w-full py-3 bg-white text-blue-600 font-black rounded-xl hover:bg-blue-50 transition shadow-lg">
                Start Consultation
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}