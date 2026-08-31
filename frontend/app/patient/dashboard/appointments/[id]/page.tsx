"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { Video, ArrowLeft, ShieldCheck, UserCheck, Mic, MicOff, Camera, CameraOff } from "lucide-react";

// Free public Google STUN servers to discover peer network paths across the internet
const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export default function PatientRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params?.id;

  const [appointment, setAppointment] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [callStatus, setCallStatus] = useState<string>("Initializing camera & secure connection...");
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVideoOff, setIsVideoOff] = useState<boolean>(false);

  // Media & WebRTC Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "https://medicareai-1.onrender.com";

  useEffect(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("jwt");
    if (!token) {
      setErrorMsg("Authentication token missing. Please log in again.");
      setTimeout(() => router.push("/login"), 2000);
      return;
    }

    if (!roomId) {
      setErrorMsg("Invalid consultation room ID.");
      return;
    }

    // 1. Fetch appointment details matching backend route /api/my-appointments
    fetch(`${API_BASE}/api/my-appointments`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Could not retrieve consultation details.");
        return res.json();
      })
      .then((data) => {
        const currentApt = Array.isArray(data) 
          ? data.find((apt: any) => String(apt.id) === String(roomId))
          : data;
        if (currentApt) {
          setAppointment(currentApt);
        } else {
          setAppointment({ id: roomId, doctor_name: "Practitioner" });
        }
      })
      .catch((err) => {
        console.error("Room details fetch error:", err);
        setAppointment({ id: roomId, doctor_name: "Practitioner" });
      });

    // 2. Connect to the Backend Socket.io Signaling Server
    socketRef.current = io(API_BASE);
    const socket = socketRef.current;

    // 3. Request Local Camera & Microphone Access
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // 4. Join the specific Socket room once media is loaded
        if (socket) {
          socket.emit("join-room", roomId);
          setCallStatus("Waiting for doctor to join session...");
        }
      })
      .catch((err) => {
        console.error("Media permission error:", err);
        setErrorMsg("Could not access camera or microphone. Please check browser permissions.");
      });

    // 5. Setup WebRTC Signaling Event Listeners
    socket.on("peer-joined", async (peerId) => {
      setCallStatus("Doctor joined! Establishing secure peer connection...");
      const pc = createPeerConnection(peerId);
      peerConnectionRef.current = pc;

      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("offer", { target: peerId, offer, roomId });
      } catch (e) {
        console.error("Error creating offer:", e);
      }
    });

    socket.on("offer", async ({ offer, sender }) => {
      setCallStatus("Connecting with doctor...");
      const pc = createPeerConnection(sender);
      peerConnectionRef.current = pc;

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answer", { target: sender, answer, roomId });
      } catch (e) {
        console.error("Error handling offer:", e);
      }
    });

    socket.on("answer", async ({ answer }) => {
      if (peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
          setCallStatus("Live Secure Call Active");
        } catch (e) {
          console.error("Error handling answer:", e);
        }
      }
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      if (peerConnectionRef.current && candidate) {
        try {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error("Error adding received ICE candidate:", e);
        }
      }
    });

    // Cleanup on unmount
    return () => {
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      socket.disconnect();
    };
  }, [roomId, router, API_BASE]);

  const createPeerConnection = (peerId: string) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    localStreamRef.current?.getTracks().forEach((track) => {
      pc.addTrack(track, localStreamRef.current!);
    });

    pc.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
      setCallStatus("Live Secure Call Active");
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit("ice-candidate", {
          target: peerId,
          candidate: event.candidate,
          roomId,
        });
      }
    };

    return pc;
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleCamera = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner - Matching Dashboard Uniformity */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => router.push("/patient/dashboard/appointments")}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 mb-2 cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to Appointments
          </button>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Telehealth Consultation</h2>
          <p className="text-slate-400 font-bold text-xs mt-1">
            Doctor: <span className="text-slate-700">{appointment?.doctor_name || "Practitioner"}</span> | Status: <span className="text-blue-600">{callStatus}</span>
          </p>
        </div>
        <button
          onClick={() => router.push("/patient/dashboard/appointments")}
          className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-5 py-3 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer self-start"
        >
          Leave Room
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-2xl">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Main Container Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Video Section */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-slate-50 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">
                <Video size={20} />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">Virtual Consultation Room #{roomId}</h3>
                <p className="text-[11px] font-semibold text-slate-400">Secure Peer-to-Peer Medical Video Gateway</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl text-xs font-bold">
              <ShieldCheck size={16} /> End-to-End Encrypted
            </div>
          </div>

          {/* Video Screen Area */}
          <div className="bg-slate-900 rounded-3xl aspect-video relative flex flex-col items-center justify-center text-white shadow-inner overflow-hidden">
            {/* Doctor's Remote Video Stream */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover absolute inset-0 z-0 bg-slate-950"
            />

            {/* Top Overlay Badge */}
            <div className="absolute top-6 left-6 flex items-center gap-2 bg-slate-800/80 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold border border-slate-700 z-10">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {callStatus}
            </div>

            {/* Fallback state when remote stream isn't active yet */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 pointer-events-none z-0">
              <div className="w-16 h-16 bg-slate-800/80 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-3">
                <UserCheck size={28} />
              </div>
              <h4 className="font-bold text-sm text-slate-300">Waiting for doctor to join session...</h4>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs">The video stream will connect automatically once your practitioner enters the room.</p>
            </div>

            {/* Patient Local Video Preview Box (PiP) */}
            <div className="absolute bottom-6 right-6 w-36 h-24 bg-slate-950 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl z-20 flex items-center justify-center">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 left-2 bg-black/70 px-1.5 py-0.5 rounded text-[9px] text-white font-bold">
                You (Patient)
              </span>
            </div>

            {/* Floating Control Bar */}
            <div className="absolute bottom-6 left-6 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-800 px-4 py-2.5 rounded-2xl shadow-xl z-30">
              <button
                onClick={toggleMute}
                className={`px-3 py-2 rounded-xl transition text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                  isMuted ? "bg-rose-500 text-white" : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                }`}
                title="Toggle Mic"
              >
                {isMuted ? <MicOff size={14} /> : <Mic size={14} />}
                {isMuted ? "Unmute" : "Mute"}
              </button>
              <button
                onClick={toggleCamera}
                className={`px-3 py-2 rounded-xl transition text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                  isVideoOff ? "bg-rose-500 text-white" : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                }`}
                title="Toggle Camera"
              >
                {isVideoOff ? <CameraOff size={14} /> : <Camera size={14} />}
                {isVideoOff ? "Camera On" : "Camera Off"}
              </button>
              <button
                onClick={() => router.push("/patient/dashboard/appointments")}
                className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-md"
              >
                End Call
              </button>
            </div>
          </div>
        </div>

        {/* Consultation Notes Sidebar */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-50 pb-3">
              Consultation Notes
            </h3>
            <p className="text-xs text-slate-600 font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100 leading-relaxed">
              {appointment?.medical_history || "No clinical notes added yet for this session."}
            </p>
          </div>

          <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-2xl space-y-1">
            <h4 className="text-xs font-bold text-blue-900">Secure WebRTC Gateway</h4>
            <p className="text-[11px] text-blue-600 leading-relaxed font-medium">
              Your video consultation is routed securely through direct client encryption nodes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}