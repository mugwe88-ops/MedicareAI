"use client";
import { useState, useEffect } from "react";

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://medicareai-1.onrender.com/api/appointments")
      .then(res => res.json())
      .then(data => {
        setAppointments(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <header className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Clinical Console</h2>
          <p className="text-slate-400 font-bold mt-2 text-sm uppercase tracking-widest tracking-[0.2em]">Live Clinical Feed</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-3 pr-8 rounded-[2rem] border border-slate-100 shadow-sm">
           <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-black">SJ</div>
           <div className="text-left">
             <p className="text-sm font-black text-slate-900 leading-none">Dr. Sarah Johnson</p>
             <p className="text-[10px] font-bold text-blue-500 uppercase mt-1">Chief Medical Officer</p>
           </div>
        </div>
      </header>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
        <table className="w-full text-left">
          {/* ... Keep your existing <thead> and <tbody> logic here ... */}
        </table>
      </div>
    </>
  );
}