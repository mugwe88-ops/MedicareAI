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

  // Setup camera and microphone stream
  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        mediaStreamRef.current = stream;
        if (doctorVideoRef.current) {
          doctorVideoRef.current.srcObject = stream;
          await doctorVideoRef.current.play();
        }
      } catch (err: any) {
        console.error("Camera access error:", err);
        setCameraError(err.message || "Could not access camera/microphone.");
      }
    }

    setupCamera();

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Handle Mute/Unmute Audio
  const toggleAudio = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = isAudioMuted; // if currently muted, enable it (so false becomes true)
      });
      setIsAudioMuted(!isAudioMuted);
    }
  };

  // Handle Turn Video On/Off
  const toggleVideo = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = isVideoMuted;
      });
      setIsVideoMuted(!isVideoMuted);
    }
  };

  // Handle End Call & Cleanup
  const handleEndCall = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    router.push("/doctors/dashboard");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6">
      {/* Top Bar */}
      <div className="flex justify-between items-center max-w-7xl w-full mx-auto">
        <button
          onClick={handleEndCall}
          className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition cursor-pointer"
        >
          <ArrowLeft size={16} /> Return to Dashboard
        </button>
        <div className="bg-slate-900 border border-slate-800 px-4 py-1.5 rounded-full flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-semibold tracking-wider">SECURE TELEHEALTH ROOM #{appointmentId}</span>
        </div>
        <div className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
          Duration: {formatTime(callDuration)}
        </div>
      </div>

      {/* Video Grid */}
      <div className="max-w-5xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 my-auto">
        {/* Patient Feed */}
        <div className="relative bg-slate-900 rounded-2xl border border-slate-800 aspect-video flex items-center justify-center overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
          <div className="text-center space-y-2 z-10">
            <div className="w-16 h-16 rounded-full bg-blue-600/30 border border-blue-500/50 flex items-center justify-center mx-auto text-blue-400 font-bold text-xl">
              P
            </div>
            <p className="text-sm font-semibold text-slate-300">Patient Video Feed</p>
            <p className="text-xs text-slate-500">Waiting for patient connection...</p>
          </div>
          <span className="absolute bottom-3 left-3 bg-slate-950/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-medium text-slate-300">
            Patient (Remote)
          </span>
        </div>

        {/* Doctor Feed */}
        <div className="relative bg-slate-900 rounded-2xl border border-slate-800 aspect-video flex items-center justify-center overflow-hidden shadow-2xl">
          <video
            ref={doctorVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${isVideoMuted ? 'hidden' : 'block'}`}
          />
          {(isVideoMuted || cameraError) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2 bg-slate-900 z-10">
              <div className="w-16 h-16 rounded-full bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400 font-bold text-xl">
                Dr
              </div>
              <p className="text-xs font-semibold text-red-400">
                {cameraError ? 'Camera Blocked/Unavailable' : 'Camera Off'}
              </p>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none"></div>
          <span className="absolute bottom-3 left-3 bg-slate-950/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-medium text-slate-300 z-20">
            Doctor (You)
          </span>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex justify-center items-center gap-4 pb-4">
        <button
          onClick={toggleAudio}
          className={`p-4 rounded-2xl transition cursor-pointer ${isAudioMuted ? "bg-red-600 text-white" : "bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800"}`}
          title={isAudioMuted ? "Unmute Audio" : "Mute Audio"}
        >
          {isAudioMuted ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        <button
          onClick={toggleVideo}
          className={`p-4 rounded-2xl transition cursor-pointer ${isVideoMuted ? "bg-red-600 text-white" : "bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800"}`}
          title={isVideoMuted ? "Start Camera" : "Stop Camera"}
        >
          {isVideoMuted ? <VideoOff size={20} /> : <Video size={20} />}
        </button>

        <button
          onClick={handleEndCall}
          className="flex items-center gap-2 px-6 py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition shadow-lg shadow-red-900/20 cursor-pointer"
        >
          <PhoneOff size={18} /> End Call
        </button>
      </div>
    </div>
  );
}
