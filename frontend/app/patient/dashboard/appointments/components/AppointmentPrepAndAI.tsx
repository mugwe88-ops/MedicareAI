"use client";

import { FileText, UserCheck, Upload, Mic, Sparkles } from "lucide-react";

interface AppointmentPrepAndAIProps {
  onSelectPrep: (title: string) => void;
  onAiAction: (actionType: "summarize" | "questions") => void;
}

export default function AppointmentPrepAndAI({ onSelectPrep, onAiAction }: AppointmentPrepAndAIProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          <h4 className="text-sm font-black text-slate-900 mb-1 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" /> Prepare for your upcoming visit
          </h4>
          <p className="text-xs text-slate-500 font-medium mb-4">Complete these checklist items to ensure a smooth consultation.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onSelectPrep("Bring Identification Card")}
            className="p-3.5 bg-white hover:bg-slate-50 rounded-2xl text-left border border-slate-200/60 shadow-xs transition cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-blue-600 mb-1.5" />
            <p className="text-xs font-bold text-slate-800">Bring ID</p>
            <p className="text-[10px] text-slate-400 font-medium">Verify identity</p>
          </button>
          <button
            onClick={() => onSelectPrep("Upload Insurance Policy Document")}
            className="p-3.5 bg-white hover:bg-slate-50 rounded-2xl text-left border border-slate-200/60 shadow-xs transition cursor-pointer"
          >
            <Upload className="w-4 h-4 text-emerald-600 mb-1.5" />
            <p className="text-xs font-bold text-slate-800">Upload Policy</p>
            <p className="text-[10px] text-slate-400 font-medium">Insurance card</p>
          </button>
          <button
            onClick={() => onSelectPrep("Add Medical Symptoms Log")}
            className="p-3.5 bg-white hover:bg-slate-50 rounded-2xl text-left border border-slate-200/60 shadow-xs transition cursor-pointer"
          >
            <FileText className="w-4 h-4 text-amber-600 mb-1.5" />
            <p className="text-xs font-bold text-slate-800">Add Symptoms</p>
            <p className="text-[10px] text-slate-400 font-medium">Update log</p>
          </button>
          <button
            onClick={() => onSelectPrep("Hardware Test for Microphone & Camera")}
            className="p-3.5 bg-white hover:bg-slate-50 rounded-2xl text-left border border-slate-200/60 shadow-xs transition cursor-pointer"
          >
            <Mic className="w-4 h-4 text-purple-600 mb-1.5" />
            <p className="text-xs font-bold text-slate-800">Test Hardware</p>
            <p className="text-[10px] text-slate-400 font-medium">Mic & Video check</p>
          </button>
        </div>
      </div>

      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-blue-400 text-xs font-extrabold tracking-wider uppercase mb-1">
            <Sparkles className="w-4 h-4" /> AI Health Assistant
          </div>
          <h4 className="text-base font-bold text-white mb-1">Need consultation help?</h4>
          <p className="text-xs text-slate-400">Let AI prepare your notes and doctor questions.</p>
        </div>
        <div className="space-y-2 mt-4">
          <button
            onClick={() => onAiAction("summarize")}
            className="w-full text-left text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2.5 rounded-xl transition cursor-pointer flex items-center justify-between"
          >
            <span>✨ Summarize my symptoms</span>
            <span className="text-[10px] text-blue-400 font-mono">RUN</span>
          </button>
          <button
            onClick={() => onAiAction("questions")}
            className="w-full text-left text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2.5 rounded-xl transition cursor-pointer flex items-center justify-between"
          >
            <span>❓ Generate questions for doctor</span>
            <span className="text-[10px] text-blue-400 font-mono">RUN</span>
          </button>
        </div>
      </div>
    </div>
  );
}