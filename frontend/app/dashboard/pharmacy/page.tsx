'use client';

import { Pill, Search } from "lucide-react";

export default function PharmacyPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen text-slate-100">
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tight text-white">Pharmacy Store</h1>
        <p className="text-slate-400 text-sm mt-1">Order your prescription medicines and health essentials directly to your home.</p>
      </div>

      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 max-w-xl shadow-xl">
        <div className="flex gap-2 p-3 border border-slate-800 rounded-xl items-center bg-slate-950">
          <Search className="w-5 h-5 text-slate-500 shrink-0" />
          <input 
            type="text" 
            placeholder="Search prescriptions, tablets, vitamins..." 
            className="w-full bg-transparent outline-none text-sm text-slate-200 placeholder:text-slate-600"
          />
        </div>
        
        <div className="mt-12 text-center text-slate-600 py-12">
          <Pill className="w-12 h-12 mx-auto text-slate-700 mb-3 animate-pulse" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">No Orders Found</p>
          <p className="text-xs text-slate-500 mt-1">Your digital prescriptions will appear here once verified by a clinician.</p>
        </div>
      </div>
    </div>
  );
}