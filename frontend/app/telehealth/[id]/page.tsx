'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';

// STUN & TURN Server Configuration for Cross-Network Traversal
const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelay',
      credential: 'openrelay',
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelay',
      credential: 'openrelay',
    },
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

  // Target Socket backend URL
  const SOCKET_URL =
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'https://medicareai-yb5c.onrender.com';

  useEffect(() => {
    if (!appointmentId) return;

    // 1. Initialize Socket.io connection
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    const iceCandidatesQueue: RTCIceCandidateInit[] = [];

    socket.on('connect', () => {
      console.log('⚡ Connected to Telehealth Signaling Server:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Socket Connection Error:', err.message);
    });

    async function initWebRTC() {
      try {
        // 2. Get Local Media Stream
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = stream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // 3. Initialize PeerConnection
        const pc = new RTCPeerConnection(ICE_SERVERS);
        peerConnection.current = pc;

        // Add local tracks to peer connection
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        // 4. Handle Remote Stream Arrival
        pc.ontrack = (event) => {
          console.log('🎥 Received Remote Feed Track:', event.streams);
          const incomingStream =
            event.streams && event.streams[0]
              ? event.streams[0]
              : new MediaStream([event.track]);

          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = incomingStream;
          }
          setConnecting(false);
          setCallActive(true);
        };

        // 5. Send ICE Candidates to Peer via Socket
        pc.onicecandidate = (event) => {
          if (event.candidate && socketRef.current) {
            socketRef.current.emit('ice-candidate', {
              roomId: appointmentId,
              candidate: event.candidate,
            });
          }
        };

        // Helper function to drain ICE candidate queue
        const processIceQueue = async () => {
          while (iceCandidatesQueue.length > 0) {
            const candidate = iceCandidatesQueue.shift();
            if (candidate) {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            }
          }
        };

        // Signaling Event Handlers

        // Executed when a new participant joins after us
        socket.on('user-joined', async () => {
          console.log('👤 Participant joined room, generating WebRTC offer...');
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('offer', { roomId: appointmentId, offer });
        });

        // Executed if we joined a room that already has a participant
        socket.on('room-ready', async () => {
          console.log('👥 Joined existing room, waiting for offer...');
        });

        socket.on('offer', async (data) => {
          console.log('📩 Received WebRTC offer, generating answer...');
          await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
          await processIceQueue();

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('answer', { roomId: appointmentId, answer });

          setConnecting(false);
          setCallActive(true);
        });

        socket.on('answer', async (data) => {
          console.log('📩 Received WebRTC answer, finalizing peer connection');
          await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
          await processIceQueue();

          setConnecting(false);
          setCallActive(true);
        });

        socket.on('ice-candidate', async (data) => {
          if (data.candidate) {
            if (pc.remoteDescription && pc.remoteDescription.type) {
              await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
            } else {
              iceCandidatesQueue.push(data.candidate);
            }
          }
        });

        // 6. Join Room AFTER registering event listeners
        socket.emit('join-room', { roomId: appointmentId });
      } catch (err) {
        console.error('Telehealth WebRTC setup error:', err);
        setConnecting(false);
      }
    }

    initWebRTC();

    return () => {
      // Clean up media streams and socket connection on unmount
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
  }, [appointmentId, SOCKET_URL]);

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
      {/* Top Bar */}
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
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              callActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`}
          ></span>
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
            className={`w-full h-full object-cover absolute inset-0 ${
              connecting ? 'hidden' : 'block'
            }`}
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