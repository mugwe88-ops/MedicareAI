'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19020' },
    { urls: 'stun:stun1.l.google.com:19020' },
  ],
};

export default function TelehealthSession() {
  const router = useRouter();
  const params = useParams();
  const appointmentId = params?.id;

  const [connecting, setConnecting] = useState(true);
  const [callActive, setCallActive] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://medicareai-1.onrender.com';

  useEffect(() => {
    if (!appointmentId) return;

    // Initialize Socket.io connection
    const socket = io(API_BASE, {
      transports: ['websocket'],
    });
    socketRef.current = socket;

    async function initWebRTC() {
      try {
        // 1. Get Local Media Stream
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = stream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // 2. Initialize PeerConnection
        const pc = new RTCPeerConnection(ICE_SERVERS);
        peerConnection.current = pc;

        // Add local tracks to peer connection
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        // 3. Handle Remote Stream
        pc.ontrack = (event) => {
          if (remoteVideoRef.current && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
            setConnecting(false);
            setCallActive(true);
          }
        };

        // 4. Send ICE Candidates to Peer via Socket
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit('ice-candidate', {
              roomId: appointmentId,
              candidate: event.candidate,
            });
          }
        };

        // 5. Join Telehealth Room
        socket.emit('join-room', { roomId: appointmentId });

        // Handle peer joined event (Trigger Offer)
        socket.on('user-joined', async () => {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('offer', { roomId: appointmentId, offer });
        });

        // Handle incoming Offer
        socket.on('offer', async (data) => {
          await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('answer', { roomId: appointmentId, answer });
        });

        // Handle incoming Answer
        socket.on('answer', async (data) => {
          await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        });

        // Handle incoming ICE Candidates
        socket.on('ice-candidate', async (data) => {
          if (data.candidate) {
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
          }
        });

      } catch (err) {
        console.error('Telehealth connection error:', err);
        setConnecting(false);
      }
    }

    initWebRTC();

    return () => {
      // Clean up media and sockets on unmount
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (peerConnection.current) {
        peerConnection.current.close();
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [appointmentId, API_BASE]);

  const toggleMic = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = micMuted;
      });
      setMicMuted(!micMuted);
    }
  };

  const toggleCam = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = camOff;
      });
      setCamOff(!camOff);
    }
  };

  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (peerConnection.current) {
      peerConnection.current.close();
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    router.back();
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white p-6 flex flex-col">
      {/* Top Bar with Back Button */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={endCall}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#131926] border border-gray-800 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg text-xs font-medium transition-colors shadow-sm"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-lg font-bold">Telehealth Appointment #{appointmentId}</h1>
            <p className="text-gray-400 text-xs">End-to-End Encrypted HIPAA Compliant Session</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${callActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
          <span className="text-xs text-gray-300 font-medium">
            {connecting ? 'Connecting...' : callActive ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow mb-6">
        {/* Remote Participant */}
        <div className="bg-[#131926] border border-gray-800 rounded-xl relative overflow-hidden flex flex-col items-center justify-center min-h-[350px]">
          {connecting && (
            <div className="flex flex-col items-center gap-3 z-20">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-400">Waiting for remote participant feed...</p>
            </div>
          )}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className={`w-full h-full object-cover absolute inset-0 ${connecting ? 'hidden' : 'block'}`}
          />
          <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded-md text-xs font-medium backdrop-blur-sm z-10">
            Remote Participant
          </div>
        </div>

        {/* Local Feed */}
        <div className="bg-[#131926] border border-gray-800 rounded-xl relative overflow-hidden flex items-center justify-center min-h-[350px]">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover absolute inset-0 transform -scale-x-100"
          />
          <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded-md text-xs font-medium backdrop-blur-sm z-10">
            You (Local Feed)
          </div>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="flex justify-center items-center gap-4 py-4 bg-[#131926] border border-gray-800 rounded-xl">
        <button
          onClick={toggleMic}
          className={`px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
            micMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-800 hover:bg-gray-700 text-gray-200'
          }`}
        >
          {micMuted ? 'Unmute Mic' : 'Mute Mic'}
        </button>
        <button
          onClick={toggleCam}
          className={`px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
            camOff ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-800 hover:bg-gray-700 text-gray-200'
          }`}
        >
          {camOff ? 'Turn Camera On' : 'Turn Camera Off'}
        </button>
        <button
          onClick={endCall}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors"
        >
          Leave Call
        </button>
      </div>
    </div>
  );
}