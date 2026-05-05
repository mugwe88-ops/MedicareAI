"use client";
import { useState } from "react";
import { 
  Users, CheckCircle2, Trash2, Search, Bell, Filter
} from "lucide-react";

export default function ClinicalConsole() {
  // We no longer need activeTab or sidebarItems here because the 
  // Sidebar logic is handled by the parent layout.tsx.

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
      {/* Top Header - High Contrast */}
      <header className="h-24 bg-white border-b border-slate-200 flex items-center justify-between px-12 sticky top-0 z-10">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search patients, appointments, or medical records..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
          />
        </div>
        
        <div className="flex items-center space-x-8">
          <button className="relative p-2 text-slate-400 hover:text-blue-600 transition-colors">
            <Bell size={22} />
            <span className="absolute top-2 right-2 h-2 w-2 bg-rose-500 rounded-full border-2 border-white" />
          </button>
          <div className="h-10 w-px bg-slate-200" />
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-slate-900 leading-tight">Dr. William Weru</p>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Medical Technologist</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-blue-600 border-4 border-blue-50 flex items-center justify-center text-white font-black text-sm shadow-sm">
              WW
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Body */}
      <div className="flex-1 overflow-y-auto p-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Clinical Console</h1>
              <p className="text-slate-500 font-semibold mt-2">
                You have <span className="text-blue-600">2 pending appointments</span> for today.
              </p>
            </div>
            <button className="flex items-center space-x-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
              <Filter size={16} />
              <span>Filter Results</span>
            </button>
          </div>

          {/* Modern Table Design */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200/60 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Patient Profile</th>
                  <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Visit Timing</th>
                  <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Medical Reason</th>
                  <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Status</th>
                  <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[
                  { date: "30 Apr 2026", time: "05:03 PM", status: "Completed", color: "emerald" },
                  { date: "29 Apr 2026", time: "04:53 PM", status: "Pending", color: "orange" }
                ].map((row, idx) => (
                  <tr key={idx} className="group hover:bg-blue-50/30 transition-all">
                    <td className="px-10 py-8">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:shadow-sm transition-all">
                          <Users size={18} />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 group-hover:text-blue-700 transition-colors">William Weru</p>
                          <p className="text-xs text-slate-400 font-bold tracking-wide">0723503988</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <p className="font-bold text-slate-700 text-sm">{row.date}</p>
                      <p className="text-blue-600 text-xs font-black mt-0.5">{row.time}</p>
                    </td>
                    <td className="px-10 py-8">
                      <span className="px-4 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-black rounded-full uppercase tracking-wider border border-slate-200/50">
                        General Consultation
                      </span>
                    </td>
                    <td className="px-10 py-8">
                      <span className={`px-4 py-1.5 bg-${row.color}-50 text-${row.color}-600 text-[10px] font-black rounded-full uppercase tracking-wider border border-${row.color}-100`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex justify-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button className="p-3 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all border border-transparent hover:border-emerald-100 shadow-sm">
                          <CheckCircle2 size={18} />
                        </button>
                        <button className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100 shadow-sm">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-8 bg-slate-50/50 border-t border-slate-100 text-center">
              <button className="text-sm font-black text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-widest">
                View Full Appointment History
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}