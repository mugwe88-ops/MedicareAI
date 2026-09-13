"use client";

import { FileText, Pill, FlaskConical, ShieldCheck, Download } from "lucide-react";

interface RecordCounts {
  total: number;
  prescriptions: number;
  labResults: number;
  vaccines: number;
}

interface RecordsSummaryHeaderProps {
  counts: RecordCounts;
  onDownloadAll: () => void;
}

export default function RecordsSummaryHeader({ counts, onDownloadAll }: RecordsSummaryHeaderProps) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-black text-slate-900">Medical Records</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Everything issued by verified doctors in one secure place.
          </p>
        </div>
        <button
          onClick={onDownloadAll}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-2xl shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4" /> Download All
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
          <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{counts.total}</p>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Records</p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
          <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{counts.prescriptions}</p>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Prescriptions</p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
          <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{counts.labResults}</p>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Lab Results</p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
          <div className="p-2.5 bg-purple-100 text-purple-600 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{counts.vaccines}</p>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Vaccines</p>
          </div>
        </div>
      </div>
    </div>
  );
}