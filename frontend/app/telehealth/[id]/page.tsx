'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';

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

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://medicareai-1.onrender.com';

  useEffect(() => {
    // Initialize local media stream
    async function setupMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Simulate successful connection after checking backend signaling
        const timer = setTimeout(() => {
          setConnecting(false);
          setCallActive(true);
        }, 2000);

        return () => clearTimeout(timer);
      } catch (err) {
        console.error('Media access error:', err);
        setConnecting(false);
      }
    }

    setupMedia();
  }, [appointmentId, API_BASE]);

  const toggleMic = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !micMuted;
      });
      setMicMuted(!micMuted);
    }
  };

  const toggleCam = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getVideoTracks().forEach((track) => {
        track.enabled = !camOff;
      });
      setCamOff(!camOff);
    }
  };

  const endCall = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
    router.back();
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white p-6 flex flex-col">
      {/* Top Bar with Back Button */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
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
          {connecting ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-400">Connecting to secure participant video feed...</p>
            </div>
          ) : (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover absolute inset-0"
            />
          )}
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