"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";

export default function TelehealthSessionPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params?.id;

  return (
    <div className="min-h-screen bg-[#070b14] text-white p-8 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-2">Telehealth Appointment #{appointmentId}</h1>
      <p className="text-slate-400 mb-6">Connecting to secure patient video feed...</p>
      <button 
        onClick={() => router.back()} 
        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-semibold"
      >
        Return to Schedule
      </button>
    </div>
  );
}