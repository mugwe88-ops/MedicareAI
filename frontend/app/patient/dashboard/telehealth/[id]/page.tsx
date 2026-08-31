"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";

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

  // Media & WebRTC Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<Socket | null>(null);

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
        // Find the specific appointment matching roomId/id
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

      // Create WebRTC Offer
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

    // Cleanup on unmount (stop camera streams and disconnect socket)
    return () => {
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      socket.disconnect();
    };
  }, [roomId, router]);

  // Helper function to initialize RTCPeerConnection
  const createPeerConnection = (peerId: string) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Add local camera/mic tracks to be sent to the doctor
    localStreamRef.current?.getTracks().forEach((track) => {
      pc.addTrack(track, localStreamRef.current!);
    });

    // Listen for incoming remote video/audio stream from the doctor
    pc.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
      setCallStatus("Live Secure Call Active");
    };

    // Gather and send network ICE candidates to the peer via signaling server
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

  // Control button toggles
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) audioTrack.enabled = !audioTrack.enabled;
    }
  };

  const toggleCamera = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) videoTrack.enabled = !videoTrack.enabled;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-8 space-y-6 my-4 min-h-[80vh] flex flex-col justify-between">
      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
            <span>🎥</span> Telehealth Consultation
          </h1>
          <p className="text-xs text-blue-400 font-medium mt-0.5">
            Doctor: {appointment?.doctor_name || "Practitioner"} | Status: {callStatus}
          </p>
        </div>
        <button
          onClick={() => router.push("/patient/dashboard/appointments")}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition border border-slate-700 cursor-pointer"
        >
          Leave Room
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-950/80 border border-red-800 text-red-300 text-sm rounded-xl">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* VIDEO CONTAINER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
        {/* MAIN VIDEO SCREEN */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center relative min-h-[480px] shadow-2xl overflow-hidden">
          
          {/* Doctor's Remote Video Stream */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover rounded-xl absolute inset-0 z-0 bg-slate-950"
          />

          {/* Waiting Overlay / Status Banner */}
          <div className="absolute top-4 left-4 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-300 font-medium flex items-center gap-2 z-10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            {callStatus}
          </div>

          {/* Patient Local Video Preview Box (Picture-in-Picture) */}
          <div className="absolute bottom-20 right-6 w-40 h-28 bg-slate-950 border border-slate-700 rounded-xl overflow-hidden shadow-2xl z-20 flex items-center justify-center">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-1 left-2 bg-black/70 px-1.5 py-0.5 rounded text-[10px] text-white font-medium">
              You (Patient)
            </span>
          </div>

          {/* CONTROL BAR */}
          <div className="absolute bottom-4 flex items-center gap-3 bg-slate-950/90 border border-slate-800 px-5 py-3 rounded-2xl shadow-xl z-30">
            <button
              onClick={toggleMute}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition text-xs font-bold cursor-pointer"
            >
              Mute Mic
            </button>
            <button
              onClick={toggleCamera}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition text-xs font-bold cursor-pointer"
            >
              Camera On/Off
            </button>
            <button
              onClick={() => router.push("/patient/dashboard/appointments")}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-lg shadow-red-600/30"
            >
              End Call
            </button>
          </div>
        </div>

        {/* CONSULTATION NOTES SIDEBAR */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
              CONSULTATION NOTES
            </h3>
            <p className="text-xs text-slate-400 bg-slate-800/40 p-3 rounded-xl border border-slate-800/80">
              {appointment?.medical_history || "No clinical notes added yet for this session."}
            </p>
          </div>

          <div className="p-3 bg-blue-950/40 border border-blue-900/60 rounded-xl space-y-1">
            <h4 className="text-xs font-bold text-blue-300">Session Status</h4>
            <p className="text-[11px] text-blue-400/90 leading-relaxed">
              Connected via secure WebRTC peer gateway.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}