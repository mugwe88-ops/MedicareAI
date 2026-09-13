"use client";

import { Download, Share2, Upload, MessageSquare } from "lucide-react";

interface QuickActionsBarProps {
  onDownloadAll: () => void;
  onUploadExternal: () => void;
  onRequestCorrection: () => void;
  onShare: () => void;
}

export default function QuickActionsBar({
  onDownloadAll,
  onUploadExternal,
  onRequestCorrection,
  onShare,
}: QuickActionsBarProps) {
  return (
    <div className="bg-slate-900 text-white p-4 rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-3">
      <div className="px-2">
        <p className="text-xs font-black text-white">Quick Record Actions</p>
        <p className="text-[10px] text-slate-400">Manage or export your health files instantly</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onDownloadAll}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-blue-400" /> Export All
        </button>

        <button
          onClick={onShare}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5 text-emerald-400" /> Share Records
        </button>

        <button
          onClick={onUploadExternal}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5 text-purple-400" /> Upload External
        </button>

        <button
          onClick={onRequestCorrection}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition cursor-pointer"
        >
          <MessageSquare className="w-3.5 h-3.5 text-amber-400" /> Request Correction
        </button>
      </div>
    </div>
  );
}