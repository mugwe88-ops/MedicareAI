"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Consultation {
  id: number | string;
  doctor_name?: string;
  department?: string;
  appointment_date: string;
  appointment_time?: string;
  reason: string;
  status: string;
  telehealth_room_url?: string;
}

export default function TelehealthPage() {
  const router = useRouter();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const API_BASE = "https://medicareai-1.onrender.com";

  useEffect(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("jwt");
    if (!token) {
      setErrorMsg("No active session found. Please log in again.");
      setTimeout(() => router.push("/login"), 2000);
      return;
    }

    setLoading(true);
    fetch(`${API_BASE}/api/appointments`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load consultations");
        return res.json();
      })
      .then((data) => {
        setConsultations(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Consultations Fetch Error:", err);
        setErrorMsg("Unable to load virtual consultations.");
        setLoading(false);
      });
  }, [router]);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-8 space-y-8 my-4">
      {/* HEADER SECTION */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Telehealth Hub</h1>
        <p className="text-xs sm:text-sm text-blue-400 font-medium mt-1">
          Join high-definition secure clinical video calls with your assigned practitioners.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-950/80 border border-red-800 text-red-300 text-sm rounded-xl">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* GRID CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ACTIVE VIRTUAL CONSULTATIONS CARD */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
                📹
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Active Virtual Consultations</h3>
                <p className="text-xs text-slate-400">Ready to connect? Enter your pre-booked session securely below.</p>
              </div>
            </div>

            {loading ? (
              <p className="text-xs text-slate-400 animate-pulse py-6">Loading your scheduled sessions...</p>
            ) : consultations.length === 0 ? (
              <div className="py-8 text-center bg-slate-800/40 rounded-xl border border-slate-800 my-4">
                <p className="text-xs text-slate-400 mb-3">No active booked appointments found.</p>
                <button
                  onClick={() => router.push("/dashboard/appointments")}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition"
                >
                  Book an Appointment Now
                </button>
              </div>
            ) : (
              <div className="space-y-4 my-4 max-h-[380px] overflow-y-auto pr-1">
                {consultations.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-500/50 transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">Dr. {item.doctor_name || "Practitioner"}</span>
                        <span className="bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                          {item.status || "CONFIRMED"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        📅 {item.appointment_date ? new Date(item.appointment_date).toLocaleString() : 'Schedule pending'}
                      </p>
                      <p className="text-xs text-slate-300 italic mt-1 bg-slate-900/50 px-2 py-1 rounded inline-block">
                        "{item.reason}"
                      </p>
                    </div>

                    <a
                      href={item.telehealth_room_url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition shadow-md shadow-blue-600/30 whitespace-nowrap cursor-pointer"
                    >
                      🎥 Launch Consultation Room
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SYSTEM CHECKLIST CARD */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-emerald-600/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                🛡️
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">System Checklist</h3>
                <p className="text-xs text-slate-400">Hardware & browser permission verification.</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Please ensure browser permissions for web-camera and microphone devices are allowed before entry into any telehealth room.
            </p>
          </div>

          <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl flex items-center gap-2 text-emerald-300 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            WEBRTC HARDWARE READY
          </div>
        </div>
      </div>
    </div>
  );
}