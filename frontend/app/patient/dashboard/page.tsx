"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Heart, Activity, TrendingUp, Calendar, FileText, 
  ArrowRight, ShieldCheck, User, LogOut, ArrowLeft 
} from "lucide-react";

export default function PatientDashboardPage() {
  const [userName, setUserName] = useState("Patient");
  const router = useRouter();

  useEffect(() => {
    // Check various common storage keys to accurately fetch patient name
    const cachedName = 
      localStorage.getItem("userName") || 
      localStorage.getItem("patient_name");
      
    if (cachedName) {
      setUserName(cachedName);
    } else {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed?.name) {
            setUserName(parsed.name);
          }
        } catch (e) {
          console.error("Failed to parse user data from storage", e);
        }
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userName");
    localStorage.removeItem("patient_name");
    router.push("/login");
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Top Header Row with Welcome Banner & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Welcome Back, {userName}
          </h1>
          <p className="text-xs font-bold text-slate-400 mt-1">
            Here is a summary of your health profile and recent visits.
          </p>
        </div>
        
        {/* Navigation / Session Actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-2xl text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 rounded-2xl text-xs font-bold transition cursor-pointer shadow-sm"
          >
            <LogOut size={14} /> Log Out
          </button>
        </div>
      </div>

      {/* Main Stats / Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Overall Performance Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[11px] font-black tracking-wider uppercase text-slate-400">Overall Performance</span>
              <span className="bg-emerald-50 text-emerald-600 font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                <TrendingUp size={12} /> 95%
              </span>
            </div>
            <div className="flex items-center justify-center my-4">
              <div className="w-32 h-32 rounded-full border-8 border-blue-600 border-t-slate-100 flex items-center justify-center shadow-inner">
                <span className="text-3xl font-black text-slate-900">468</span>
              </div>
            </div>
          </div>
          <p className="text-xs font-medium text-slate-500 text-center mt-2">
            Patient is healthier than <strong className="text-slate-900 font-bold">95%</strong> of people.
          </p>
        </div>

        {/* Analytics Summary */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[11px] font-black tracking-wider uppercase text-slate-400">Analytics</span>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">Weekly</span>
          </div>

          <div className="space-y-3 my-auto">
            <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                  <Heart size={18} className="text-rose-500 fill-rose-500" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900">Heart Rate</p>
                  <p className="text-[10px] font-bold text-slate-400">Normal Range</p>
                </div>
              </div>
              <span className="font-black text-sm text-slate-900">72 bpm</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Activity size={18} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900">Blood Pressure</p>
                  <p className="text-[10px] font-bold text-slate-400">Optimized</p>
                </div>
              </div>
              <span className="font-black text-sm text-slate-900">120/80</span>
            </div>
          </div>

          <button 
            onClick={() => router.push("/patient/dashboard/medical-records")}
            className="w-full mt-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            View Full Report <ArrowRight size={14} />
          </button>
        </div>

        {/* Patient Profile Quick Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-[11px] font-black tracking-wider uppercase text-slate-400">Profile Status</span>
              <ShieldCheck className="text-blue-600" size={20} />
            </div>

            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl mx-auto flex items-center justify-center font-black text-xl shadow-sm">
                <User size={28} />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base truncate px-2">{userName}</h3>
                <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mt-0.5">Patient • Verified</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl space-y-2 mt-6">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-400">Contact:</span>
              <span className="font-bold text-slate-800">Verified Mobile</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-400">Status:</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">Active Plan</span>
            </div>
          </div>
        </div>

      </div>

      {/* Quick Actions Row */}
      <div className="bg-blue-600 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-blue-500/20">
        <div>
          <h3 className="text-lg sm:text-xl font-black tracking-tight">Need a consultation with a specialist?</h3>
          <p className="text-blue-100 text-xs font-medium mt-1">Book an appointment or jump into an instant telehealth video session.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => router.push("/patient/dashboard/appointments")}
            className="w-full md:w-auto bg-white text-blue-600 hover:bg-blue-50 px-6 py-3.5 rounded-2xl text-xs font-bold transition cursor-pointer shadow-sm text-center"
          >
            Manage Appointments
          </button>
        </div>
      </div>
    </div>
  );
}