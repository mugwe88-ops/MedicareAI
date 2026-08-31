'use client';

import { useEffect, useState, use, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Appointment {
  id: string;
  patient_name: string;
  doctor_name: string;
  appointment_date: string;
  status: string;
  telehealth_room_url?: string;
  notes?: string;
}

export default function DoctorTelehealthRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVideoOff, setIsVideoOff] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Clinical Notes State
  const [notes, setNotes] = useState<string>('');
  const [isSavingNotes, setIsSavingNotes] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const doctorVideoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Fetch appointment details and existing notes
  useEffect(() => {
    if (!id) return;

    async function fetchRoomDetails() {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('jwt') : null;
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'https://medicareai-1.onrender.com'}/api/appointments/${id}`,
          {
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
              'Content-Type': 'application/json',
            },
          }
        );

        if (!res.ok) {
          throw new Error('Failed to load telehealth room details.');
        }
        const data = await res.json();
        setAppointment(data);
        if (data.notes) {
          setNotes(data.notes);
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchRoomDetails();
  }, [id]);

  // Request Standard Video Stream
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
        console.error('Camera access error:', err);
        setCameraError(err.message || 'Could not access camera/microphone.');
      }
    }

    setupCamera();

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Handle saving clinical notes to backend
  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    setSaveSuccess(false);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('jwt') : null;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://medicareai-1.onrender.com'}/api/appointments/${id}/notes`,
        {
          method: 'PUT',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ notes }),
        }
      );

      if (!res.ok) {
        throw new Error('Failed to save clinical notes.');
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Error saving notes');
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Handle Mute Mic
  const toggleMute = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  // Handle Turn Camera Off/On
  const toggleVideo = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = isVideoOff;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const handleLeave = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    router.push('/doctors/dashboard');
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500 font-medium">Connecting to secure telehealth room...</div>;
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-12 p-6 bg-white border border-red-100 rounded-2xl shadow-sm text-center">
        <p className="text-red-600 font-semibold mb-4">Error: {error}</p>
        <button
          onClick={() => router.back()}
          className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition shadow-sm cursor-pointer"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 flex flex-col h-[calc(100vh-2rem)]">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Telehealth Consultation (Doctor Portal)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Doctor: <span className="font-bold text-slate-700">{appointment?.doctor_name || 'Dr. Robert Fox'}</span> | Patient: <span className="font-bold text-slate-700">{appointment?.patient_name || 'Patient'}</span>
          </p>
        </div>
        <button
          onClick={handleLeave}
          className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl transition cursor-pointer"
        >
          Leave Room
        </button>
      </div>

      {/* Video Grid / Main Room Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 mb-4 min-h-[400px]">
        {/* Main Video Window (Remote Patient View) */}
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl relative overflow-hidden flex items-center justify-center shadow-inner border border-slate-800">
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-slate-300 text-sm font-medium">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-3 shadow-lg">
                {appointment?.patient_name?.charAt(0) || 'P'}
              </div>
              <p className="text-lg font-bold text-white mb-1">{appointment?.patient_name || 'Patient'}</p>
              <p className="text-xs text-slate-400">Waiting for patient video stream...</p>
            </div>
          </div>

          {/* Doctor Self-View Video Box (Picture-in-Picture) */}
          <div className="absolute bottom-4 right-4 w-40 h-28 bg-slate-950 border border-slate-700 rounded-xl overflow-hidden shadow-lg flex items-center justify-center">
            <video
              ref={doctorVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : 'block'}`}
            />
            {(isVideoOff || cameraError) && (
              <div className="absolute inset-0 flex items-center justify-center text-[10px] text-red-400 bg-slate-900 text-center p-1">
                {cameraError ? 'Camera Blocked/Unavailable' : 'Camera Off'}
              </div>
            )}
            <div className="absolute bottom-1 left-2 text-[10px] bg-black/60 px-1.5 py-0.5 rounded text-white font-medium z-10">
              Doctor (You)
            </div>
          </div>
        </div>

        {/* Sidebar / Interactive Notes Editor */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-2">Consultation Notes</h2>
          <p className="text-[11px] text-slate-500 mb-3">Type clinical notes below. Changes will sync to the patient profile upon saving.</p>
          
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Type symptoms, diagnosis, prescriptions, or clinical recommendations..."
            className="flex-1 w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-3"
          />

          <div className="flex items-center justify-between gap-2">
            {saveSuccess && <span className="text-[11px] font-semibold text-emerald-600">Saved successfully!</span>}
            {!saveSuccess && <span className="text-[11px] text-slate-400"></span>}
            <button
              onClick={handleSaveNotes}
              disabled={isSavingNotes}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold text-xs rounded-xl transition shadow-sm ml-auto cursor-pointer"
            >
              {isSavingNotes ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center gap-4 flex-wrap">
        <button
          onClick={toggleMute}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
            isMuted ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {isMuted ? 'Unmute Mic' : 'Mute Mic'}
        </button>
        <button
          onClick={toggleVideo}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
            isVideoOff ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
        </button>
        <button
          onClick={handleLeave}
          className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition shadow-sm ml-auto cursor-pointer"
        >
          End Call
        </button>
      </div>
    </div>
  );
}
