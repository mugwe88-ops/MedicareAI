"use client";
import React from 'react';
import { Sparkles, ArrowUpRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AIInsights() {
  return (
    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-200 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 opacity-10 -mr-10 -mt-10">
        <Sparkles size={200} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
            <Sparkles size={20} className="text-blue-100" />
          </div>
          <h3 className="text-xl font-black tracking-tight uppercase">MedicareAI Analysis</h3>
        </div>

        <div className="space-y-6">
          <p className="text-blue-50 font-medium leading-relaxed">
            "Based on your laboratory trends from January to May 2026, your <span className="font-bold underline decoration-blue-300">Glucose levels</span> have stabilized within the normal range (92-98 mg/dL) after a brief spike in February."
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <div className="flex items-center gap-2 mb-2 text-emerald-300">
                <CheckCircle2 size={18} />
                <span className="text-xs font-black uppercase tracking-wider">Positive Trend</span>
              </div>
              <p className="text-sm font-bold">Cholesterol is down 8% since March.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <div className="flex items-center gap-2 mb-2 text-blue-200">
                <ArrowUpRight size={18} />
                <span className="text-xs font-black uppercase tracking-wider">Recommendation</span>
              </div>
              <p className="text-sm font-bold">Maintain current fiber intake and hydration.</p>
            </div>
          </div>
          
          <p className="text-[10px] text-blue-200/70 italic font-medium">
            *This AI insight is for information only. Always consult with your healthcare provider for clinical decisions.
          </p>
        </div>
      </div>
    </div>
  );
}