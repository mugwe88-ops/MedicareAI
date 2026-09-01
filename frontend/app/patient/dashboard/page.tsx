"use client";

import { useState, useEffect } from "react";
import { 
  Heart, Activity, TrendingUp, Calendar, FileText, 
  ArrowRight, ShieldCheck, User, LogOut, ArrowLeft, Search, Bell, Mail, RefreshCw 
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function PatientDashboardPage() {
  const [userName, setUserName] = useState("Patient");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Fetch profile info or token data if available
    const name = localStorage.getItem("userName");
    if (name) setUserName(name);
  }, []);

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-900 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Top Header Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search appointments, health metrics, reports..."
              className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pl-11 pr-4 py-3 text-xs font-medium text-slate-800 outline-none focus:border-blue-600 transition"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3">
            <button className="h-11 w-11 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition border border-slate-200/80 shadow-sm cursor-pointer">
              <Bell size={18} />
            </button>
            <button className="h-11 w-11 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition border border-slate-200/80 shadow-sm cursor-pointer">
              <Mail size={18} />
            </button>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Welcome Back, {userName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Here is a summary of your health profile and recent visits.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <ArrowLeft size={15} /> Back
            </button>
            <button 
              onClick={() => {
                localStorage.clear();
                router.push("/login");
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-700 rounded-2xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <LogOut size={15} /> Log Out
            </button>
          </div>
        </div>

        {/* Overall Performance Card */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-black">Overall Performance</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-bold self-start sm:self-auto">
              <TrendingUp size={14} /> 95%
            </span>
          </div>

          <div className="flex flex-col items-center justify-center py-6">
            <div className="relative h-44 w-44 sm:h-52 sm:w-52 rounded-full border-8 border-slate-100 border-t-blue-600 flex flex-col items-center justify-center text-center shadow-inner">
              <span className="text-3xl sm:text-4xl font-black text-slate-900">468</span>
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider mt-1">Health Score</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-6 text-center">
              Patient is healthier than <strong className="text-slate-900">95%</strong> of people.
            </p>
          </div>
        </div>

        {/* Analytics & Vitals Overview */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wide">Analytics</h3>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl">Weekly</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-md flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Heart Rate</span>
                <span className="text-lg font-black mt-1 block">72 bpm</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-rose-400">
                <Heart size={20} />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Blood Pressure</span>
                <span className="text-lg font-black text-slate-900 mt-1 block">120/80</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Activity size={20} />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Glucose Level</span>
                <span className="text-lg font-black text-slate-900 mt-1 block">98 mg/dL</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <ShieldCheck size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Quick Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200/80">
          <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5">
            <Calendar size={13} /> MedicareAI Portal System v2.4
          </span>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-1 px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold rounded-2xl transition cursor-pointer shadow-sm"
          >
            <RefreshCw size={13} /> Refresh Data
          </button>
        </div>

      </div>
    </div>
  );
}