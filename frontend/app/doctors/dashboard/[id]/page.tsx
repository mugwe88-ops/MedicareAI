"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Video, VideoOff, Mic, MicOff, PhoneOff, ArrowLeft } from "lucide-react";

export default function TelehealthRoom() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params?.id;

  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const doctorVideoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const API_BASE = "https://medicareai-1.onrender.com";

  // Call duration timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize camera and microphone
  useEffect(() => {
    async function initCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        mediaStreamRef.current = stream;
        if (doctorVideoRef.current) {
          doctorVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing media devices:", err);
        setCameraError("Could not access camera or microphone. Please check permissions.");
        setIsVideoMuted(true);
      }
    }

    initCamera();

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const toggleAudio = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = isAudioMuted;
      });
    }
    setIsAudioMuted(!isAudioMuted);
  };

  const toggleVideo = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = isVideoMuted;
      });
    }
    setIsVideoMuted(!isVideoMuted);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Header */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push("/doctors/dashboard")}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-sm font-bold tracking-wide">Secure Telehealth Room</h1>
            <p className="text-xs text-slate-400">Appointment ID: #{appointmentId || "Live"}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-emerald-400">
            {formatTime(callDuration)}
          </div>
        </div>
      </header>

      {/* Video Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 relative">
        {/* Remote Patient Placeholder */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden shadow-xl">
          <div className="w-24 h-24 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-3xl font-black text-blue-400 mb-3 shadow-inner">
            P
          </div>
          <h3 className="text-sm font-bold text-slate-200">Patient (Remote)</h3>
          <p className="text-xs text-slate-500 animate-pulse mt-1">Waiting for connection...</p>
        </div>

        {/* Local Doctor Feed */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden shadow-xl">
          {isVideoMuted ? (
            <div className="flex flex-col items-center gap-2 text-slate-500">
              <VideoOff size={36} />
              <p className="text-xs font-bold">Camera is Off</p>
            </div>
          ) : (
            <video 
              ref={doctorVideoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover -scale-x-100" 
            />
          )}
          {cameraError && (
            <div className="absolute bottom-16 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs px-3 py-1 rounded-lg">
              {cameraError}
            </div>
          )}
          <div className="absolute top-4 left-4 bg-slate-950/70 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-medium text-slate-300 border border-slate-800">
            Dr. Pressy Phides (You)
          </div>
        </div>

        {/* Floating Control Bar */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md border border-slate-800 px-6 py-3 rounded-2xl flex items-center gap-4 shadow-2xl z-20">
          <button
            onClick={toggleAudio}
            className={`p-3.5 rounded-xl transition-all cursor-pointer ${
              isAudioMuted 
                ? "bg-rose-500/20 text-rose-400 border border-rose-500/40" 
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            }`}
          >
            {isAudioMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-3.5 rounded-xl transition-all cursor-pointer ${
              isVideoMuted 
                ? "bg-rose-500/20 text-rose-400 border border-rose-500/40" 
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            }`}
          >
            {isVideoMuted ? <VideoOff size={20} /> : <Video size={20} />}
          </button>

          <div className="w-px h-8 bg-slate-800"></div>

          <button
            onClick={() => router.push("/doctors/dashboard")}
            className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-rose-600/20 cursor-pointer"
          >
            <PhoneOff size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">End Session</span>
          </button>
        </div>
      </div>
    </div>
  );
}