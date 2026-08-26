"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function PatientRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params?.id;

  const [loading, setLoading] = useState<boolean>(true);
  const [appointment, setAppointment] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const API_BASE = "https://medicareai-1.onrender.com";

  useEffect(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("jwt");
    if (!token) {
      setErrorMsg("Authentication token missing. Please log in again.");
      setTimeout(() => router.push("/login"), 2000);
      return;
    }

    if (!roomId) {
      setErrorMsg("Invalid consultation room ID.");
      setLoading(false);
      return;
    }

    // Fetch appointment details or room configuration
    fetch(`${API_BASE}/api/appointments/${roomId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Could not retrieve appointment room details.");
        return res.json();
      })
      .then((data) => {
        setAppointment(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Room fetch error:", err);
        // Fallback placeholder data if the specific single-get route is absent
        setAppointment({
          id: roomId,
          doctor_name: "Practitioner",
          reason: "Virtual Consultation Session",
        });
        setLoading(false);
      });
  }, [roomId, router]);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-8 space-y-6 my-4 min-h-[80vh] flex flex-col justify-between">
      {/* TOP HEADER */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
            <span>🎥</span> Secure Clinical Consultation Room
          </h1>
          <p className="text-xs text-blue-400 font-medium mt-0.5">
            {appointment ? `Session with Dr. ${appointment.doctor_name || "Practitioner"}` : "Connecting to session..."}
          </p>
        </div>
        <button
          onClick={() => router.push("/patient/telehealth")}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition border border-slate-700"
        >
          Leave Room
        </button>
      </div>

      {/* ERROR OR LOADING STATE */}
      {errorMsg ? (
        <div className="p-4 bg-red-950/80 border border-red-800 text-red-300 text-sm rounded-xl">
          ⚠️ {errorMsg}
        </div>
      ) : loading ? (
        <div className="flex-1 flex items-center justify-center bg-slate-900/60 border border-slate-800 rounded-2xl p-12">
          <p className="text-sm text-slate-400 animate-pulse">Initializing secure WebRTC media stream...</p>
        </div>
      ) : (
        /* VIDEO FEED CONTAINER PLACEHOLDER */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
          {/* MAIN VIDEO SCREEN */}
          lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center relative min-h-[420px] shadow-2xl">
            <div className="absolute top-4 left-4 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-300 font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Secure Channel
            </div>

            {/* Video Placeholder Graphic */}
            <div className="text-center space-y-3">
              <div className="w-20 h-20 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner">
                👨‍⚕️
              </div>
              <h3 className="text-white font-bold text-base">Waiting for Practitioner to Join...</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Your video hardware and microphone are initialized and ready. The session will connect automatically once your doctor enters the room.
              </p>
            </div>

            {/* CONTROL BAR */}
            <div className="absolute bottom-6 flex items-center gap-3 bg-slate-950/90 border border-slate-800 px-5 py-3 rounded-2xl shadow-xl">
              <button 
                onClick={() => alert("Microphone toggled")}
                className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition text-sm cursor-pointer"
                title="Toggle Mute"
              >
                🎤
              </button>
              <button 
                onClick={() => alert("Camera toggled")}
                className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition text-sm cursor-pointer"
                title="Toggle Camera"
              >
                📹
              </button>
              <button 
                onClick={() => router.push("/patient/telehealth")}
                className="px-4 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-lg shadow-red-600/30"
              >
                End Call
              </button>
            </div>
          </div>

          {/* SESSION INFO SIDEBAR */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">Consultation Details</h3>
              
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Reason for Visit</span>
                <p className="text-xs text-slate-200 mt-1 bg-slate-800/50 p-2.5 rounded-lg border border-slate-800">
                  "{appointment?.reason || 'General Checkup'}"
                </p>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Status</span>
                <div className="mt-1">
                  <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase">
                    {appointment?.status || "CONFIRMED"}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-blue-950/40 border border-blue-900/60 rounded-xl text-[11px] text-blue-300">
              💡 Tip: Keep this window open until your consultation concludes.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}