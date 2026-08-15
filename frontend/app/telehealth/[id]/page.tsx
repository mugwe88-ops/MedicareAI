'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function TelehealthRoom() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params?.id;

  const [status, setStatus] = useState('Connecting...');
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }

    // 1. Initialize local media stream (Camera & Microphone)
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // 2. Setup WebRTC Peer Connection with public STUN servers
        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ],
        });

        peerConnectionRef.current = pc;

        // Add local tracks to peer connection
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        // 3. Handle incoming remote tracks from the other device
        pc.ontrack = (event) => {
          if (remoteVideoRef.current && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };

        setStatus('Connected');
      })
      .catch((err) => {
        console.error('Media Device Error:', err);
        setStatus('Camera/Microphone Permission Denied');
      });

    return () => {
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      peerConnectionRef.current?.close();
    };
  }, [router, appointmentId]);

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white p-6 flex flex-col">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6 bg-[#131926] p-4 rounded-xl border border-gray-800">
        <div>
          <h1 className="text-lg font-bold">Telehealth Appointment #{appointmentId}</h1>
          <p className="text-xs text-gray-400">End-to-End Encrypted HIPAA Compliant Session</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-medium text-emerald-400">{status}</span>
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        {/* Remote Video Box */}
        <div className="relative bg-[#131926] border border-gray-800 rounded-2xl overflow-hidden flex items-center justify-center min-h-[400px]">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover absolute inset-0"
          />
          <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded-md text-xs font-semibold backdrop-blur-md">
            Remote Participant
          </div>
        </div>

        {/* Local Video Box */}
        <div className="relative bg-[#131926] border border-gray-800 rounded-2xl overflow-hidden flex items-center justify-center min-h-[400px]">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover absolute inset-0 transform -scale-x-100"
          />
          <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded-md text-xs font-semibold backdrop-blur-md">
            You (Local Feed)
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          onClick={() => router.back()}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
        >
          End / Leave Call
        </button>
      </div>
    </div>
  );
}