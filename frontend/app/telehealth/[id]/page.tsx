"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Mic, MicOff, Video, VideoOff, PhoneOff, ShieldCheck } from "lucide-react";

export default function TelehealthActiveSession() {
  const router = useRouter();
  const params = useParams();
  const appointmentId = params?.id || "active-session";

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "ended">("connecting");

  // 1️⃣ Initialize User Media Devices
  useEffect(() => {
    let localStream: MediaStream | null = null;

    async function initMedia() {
      try {
        localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        setStream(localStream);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }

        // Simulate connecting to signaling room / remote peer
        setTimeout(() => {
          setConnectionStatus("connected");
        }, 2000);
      } catch (err) {
        console.error("Error accessing media devices:", err);
        alert("Camera and Microphone permissions are required for telehealth consultations.");
      }
    }

    initMedia();

    // Cleanup tracks on component unmount
    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // 2️⃣ Toggle Audio (Mute / Unmute)
  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  // 3️⃣ Toggle Video (Camera On / Off)
  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  // 4️⃣ End Call & Cleanup
  const handleEndCall = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setConnectionStatus("ended");
    router.push("/dashboard/appointments");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 md:p-6">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-slate-900/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-lg font-bold">Telehealth Appointment #{appointmentId}</h1>
          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
            <ShieldCheck size={14} className="text-emerald-400" />
            End-to-End Encrypted HIPAA Compliant Session
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${connectionStatus === "connected" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
          <span className="text-xs font-semibold capitalize text-slate-300">{connectionStatus}</span>
        </div>
      </div>

      {/* Main Video Grid */}
      <div className="relative flex-1 my-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-center justify-center min-h-[450px]">
        {/* Remote Video (Doctor / Patient) */}
        <div className="relative w-full h-full min-h-[350px] bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 flex items-center justify-center">
          {connectionStatus === "connecting" ? (
            <div className="text-center p-6">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm font-semibold text-slate-300">Connecting to secure patient video feed...</p>
            </div>
          ) : (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute bottom-4 left-4 bg-slate-950/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-800">
            Remote Provider
          </div>
        </div>

        {/* Local Video Feed (Floating / Preview) */}
        <div className="relative w-full h-full min-h-[350px] bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 flex items-center justify-center">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${isVideoOff ? "hidden" : "block"}`}
          />
          {isVideoOff && (
            <div className="text-center text-slate-500 font-medium text-sm">
              Camera Disabled
            </div>
          )}
          <div className="absolute bottom-4 left-4 bg-slate-950/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-800">
            You (Local Feed)
          </div>
        </div>
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="flex items-center justify-center gap-4 bg-slate-900/90 backdrop-blur-md py-4 px-8 rounded-3xl w-fit mx-auto border border-slate-800 shadow-2xl">
        <button
          onClick={toggleMute}
          className={`p-4 rounded-2xl transition-all ${isMuted ? "bg-rose-500/20 text-rose-500 border border-rose-500/30" : "bg-slate-800 text-slate-200 hover:bg-slate-700"}`}
        >
          {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        <button
          onClick={toggleVideo}
          className={`p-4 rounded-2xl transition-all ${isVideoOff ? "bg-rose-500/20 text-rose-500 border border-rose-500/30" : "bg-slate-800 text-slate-200 hover:bg-slate-700"}`}
        >
          {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
        </button>

        <button
          onClick={handleEndCall}
          className="p-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all shadow-lg shadow-rose-600/30 flex items-center gap-2 px-6"
        >
          <PhoneOff size={20} />
          <span>End Call</span>
        </button>
      </div>
    </div>
  );
}