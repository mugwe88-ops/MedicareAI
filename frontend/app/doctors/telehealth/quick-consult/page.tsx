"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function QuickConsultPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#070b14] text-white p-8 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Quick Consult Session</h1>
      <p className="text-slate-400 mb-6">Initializing video room...</p>
      <button 
        onClick={() => router.back()} 
        className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-500"
      >
        Back to Dashboard
      </button>
    </div>
  );
}