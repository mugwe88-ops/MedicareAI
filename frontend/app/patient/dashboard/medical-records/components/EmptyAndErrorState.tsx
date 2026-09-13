"use client";

import { AlertTriangle, RefreshCw, HelpCircle, FileX, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface ErrorStateProps {
  onRetry: () => void;
}

export function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs text-center space-y-4 my-4">
      <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <div>
        <h3 className="text-lg font-black text-slate-900">We couldn't load your records</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          We'll try again automatically. You can also refresh manually or contact support if the issue persists.
        </p>
      </div>
      <div className="flex items-center justify-center gap-3 pt-2">
        <button
          onClick={onRetry}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-2xl shadow-xs transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry Now
        </button>
        <button
          onClick={() => window.open("/patient/support", "_blank")}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-5 py-2.5 rounded-2xl transition cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" /> Contact Support
        </button>
      </div>
    </div>
  );
}

export function EmptyState() {
  const router = useRouter();

  return (
    <div className="bg-white rounded-3xl p-10 border border-slate-200/80 shadow-xs text-center space-y-4 my-4">
      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
        <FileX className="w-8 h-8" />
      </div>
      <div>
        <h3 className="text-lg font-black text-slate-900">No medical records yet</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          Your prescriptions, lab results, and doctor's notes will appear here automatically after your consultation.
        </p>
      </div>
      <div className="pt-2">
        <button
          onClick={() => router.push("/patient/dashboard/appointments/book")}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-2xl shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Book Consultation
        </button>
      </div>
    </div>
  );
}