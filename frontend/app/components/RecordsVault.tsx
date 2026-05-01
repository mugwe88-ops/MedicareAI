"use client";
import React from 'react';
import { FileText, Upload, Share2, Lock, Search } from 'lucide-react';

export default function RecordsVault() {
  const records = [
    { id: 1, name: "Radiology_Chest_XRay.pdf", date: "2026-03-12", type: "Imaging", size: "2.4 MB" },
    { id: 2, name: "Immunization_Card_2026.pdf", date: "2026-01-05", type: "Vaccination", size: "1.1 MB" },
  ];

  return (
    <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Lock className="text-blue-600" size={24} /> Records Vault
          </h3>
          <p className="text-slate-500 font-medium text-sm">Securely encrypted medical documents</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition">
          <Upload size={18} /> Upload Document
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {records.map((file) => (
          <div key={file.id} className="group p-6 border border-slate-50 rounded-3xl bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl">
                  <FileText size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 truncate w-40">{file.name}</h4>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{file.type} • {file.date}</p>
                </div>
              </div>
              <button className="p-2 text-slate-400 hover:text-blue-600 transition">
                <Share2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        <p className="text-emerald-700 text-xs font-bold">All files are encrypted with AES-256 and stored in compliant regional servers.</p>
      </div>
    </section>
  );
}