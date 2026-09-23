"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { 
  Video, Calendar, Clock, FileText, Shield, AlertTriangle, 
  CheckCircle2, Upload, MessageSquare, Mic, Camera, PhoneOff, 
  Download, ChevronRight, Activity, Heart, Thermometer, User, Award, ArrowLeft,
  Home, Mail, UserCheck, ExternalLink, Sparkles as SparklesIcon, MicOff, VideoOff
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// Initialize direct Supabase client using client environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ConsultationHubPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-600">Loading Consultation Hub...</div>}>
      <ConsultationHubContent />
    </Suspense>
  );
}

function ConsultationHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedDoctorId = searchParams.get('doctorId');

  const [activeTab, setActiveTab] = useState<'upcoming' | 'room' | 'history'>('upcoming');
  const [timeLeft, setTimeLeft] = useState(1680); // 28 minutes in seconds
  const [inCall, setInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [symptomsInput, setSymptomsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Dynamic state for latest appointment and doctor
  const [latestAppointment, setLatestAppointment] = useState<any>(null);
  const [allAppointments, setAllAppointments] = useState<any[]>([]);
  const [loadingAppointment, setLoadingAppointment] = useState(true);

  // Webcam stream ref
  const patientVideoRef = useRef<HTMLVideoElement>(null);

  const [aiNotes, setAiNotes] = useState([
    "Patient reports mild symptoms over 3 days.",
    "Blood pressure logged at 135/85 mmHg.",
    "Medication adherence confirmed."
  ]);

  // Request camera and microphone access when entering the call or toggling video
  useEffect(() => {
    let currentStream: MediaStream | null = null;

    async function setupCamera() {
      if (inCall && !isVideoOff) {
        try {
          currentStream = await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: true 
          });
          if (patientVideoRef.current) {
            patientVideoRef.current.srcObject = currentStream;
          }
        } catch (err) {
          console.error("Error accessing media devices:", err);
        }
      } else {
        if (patientVideoRef.current && patientVideoRef.current.srcObject) {
          const stream = patientVideoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
          patientVideoRef.current.srcObject = null;
        }
      }
    }

    setupCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [inCall, isVideoOff]);

  // Fetch appointments directly using Supabase Client
  useEffect(() => {
    async function fetchAppointmentsData() {
      try {
        setLoadingAppointment(true);

        // Retrieve current active user session
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        let query = supabase
          .from('appointments')
          .select(`
            *,
            doctors (
              id,
              name,
              specialty,
              department,
              rating,
              image_url
            )
          `)
          .order('appointment_date', { ascending: true });

        // Filter by patient ID if authenticated
        if (user) {
          query = query.eq('patient_id', user.id);
        }

        const { data: rawAppointments, error: apptError } = await query;

        if (apptError) {
          console.error("Supabase appointments query error:", apptError);
          setAllAppointments([]);
          return;
        }

        if (!rawAppointments || rawAppointments.length === 0) {
          setAllAppointments([]);
          return;
        }

        const enrichedAppointments = rawAppointments.map((appt: any) => ({
          ...appt,
          doctors: appt.doctors || {
            name: appt.doctor_name || "Doctor Specialist",
            specialty: "General Practice",
            rating: 4.9
          }
        }));

        setAllAppointments(enrichedAppointments);

        if (selectedDoctorId) {
          const matched = enrichedAppointments.find((a: any) => String(a.doctor_id) === String(selectedDoctorId));
          setLatestAppointment(matched || enrichedAppointments[0]);
          if ((matched || enrichedAppointments[0])?.reason || (matched || enrichedAppointments[0])?.symptoms) {
            setSymptomsInput((matched || enrichedAppointments[0]).reason || (matched || enrichedAppointments[0]).symptoms);
          }
        } else {
          setLatestAppointment(enrichedAppointments[0]);
          if (enrichedAppointments[0]?.reason || enrichedAppointments[0]?.symptoms) {
            setSymptomsInput(enrichedAppointments[0].reason || enrichedAppointments[0].symptoms);
          }
        }
      } catch (err) {
        console.error("Error in fetchAppointmentsData via Supabase:", err);
      } finally {
        setLoadingAppointment(false);
      }
    }

    fetchAppointmentsData();
  }, [selectedDoctorId]);

  // Handle saving pre-consultation questionnaire directly via Supabase Client
  const handleSaveSymptoms = async () => {
    setIsSubmitting(true);
    try {
      let appointmentId = latestAppointment?.id;

      if (!appointmentId && allAppointments.length > 0) {
        appointmentId = allAppointments[0].id;
      }

      if (!appointmentId) {
        alert("No active appointment found to update.");
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase
        .from('appointments')
        .update({ reason: symptomsInput })
        .eq('id', appointmentId);

      if (error) {
        throw new Error(error.message);
      }

      alert(`Pre-consultation notes successfully saved and submitted to ${doctorName}!`);
    } catch (err: any) {
      console.error("Error updating questionnaire in Supabase:", err);
      alert("Failed to save details: " + (err.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Countdown timer effect
  useEffect(() => {
    if (timeLeft > 0 && !inCall) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, inCall]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  const consultationHistory = [
    {
      id: "CON-2026-089",
      date: "August 12, 2026",
      doctor: "Dr. Robert Vance, MD",
      specialty: "Cardiology Specialist",
      diagnosis: "Stage 1 Hypertension & Routine Evaluation",
      prescription: "Amlodipine 5mg - Once daily for 30 days",
      labs: "Lipid Profile & Comprehensive Metabolic Panel (Completed)",
      notesUrl: "#",
      followUp: "September 13, 2026"
    },
    {
      id: "CON-2026-042",
      date: "July 04, 2026",
      doctor: "Dr. Sarah Jenkins, MBBS",
      specialty: "General Medicine",
      diagnosis: "Acute Upper Respiratory Tract Infection",
      prescription: "Amoxicillin 500mg, Paracetamol 500mg",
      labs: "Complete Blood Count (CBC)",
      notesUrl: "#",
      followUp: "As needed"
    }
  ];

  // Helper to extract proper initials from doctor name
  const getInitials = (name: string) => {
    if (!name) return 'DR';
    const parts = name.replace(/^(Dr\.|Prof\.|Mr\.|Ms\.)\s*/i, '').trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Resolve doctor display details dynamically from fetched appointment or fallback
  const doctorName = latestAppointment?.doctors?.name || latestAppointment?.doctor_name || searchParams.get('doctorName') || "Assigned Specialist";
  const doctorSpecialty = latestAppointment?.doctors?.specialty || latestAppointment?.doctors?.department || "General Practice";
  const doctorRating = latestAppointment?.doctors?.rating || 4.9;
  const consultationType = latestAppointment?.consultation_format || latestAppointment?.consultation_type || "General Video Telehealth";
  const appointmentDateFormatted = latestAppointment?.date || latestAppointment?.appointment_date || latestAppointment?.start_time || "Today, 6:30 PM EAT";

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-10 font-sans text-slate-800">
      
      {/* Mobile Header Bar */}
      <div className="bg-white border-b border-slate-100 px-4 py-3.5 flex items-center justify-between sticky top-0 z-30 md:hidden">
        <div className="flex items-center gap-2">
          <Link href="/patient/dashboard" className="p-1.5 rounded-xl bg-slate-100 text-slate-600">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="font-black text-sm text-slate-900 tracking-tight">MedicareAI Hub</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
          WW
        </div>
      </div>

      <div className="p-4 md:p-10 max-w-7xl mx-auto">
        {/* Top Header Navigation (Desktop) */}
        <div className="hidden md:flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
              <Link href="/patient/dashboard" className="hover:underline flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
              </Link>
              <span>/</span>
              <span>Consultation & Telehealth Hub</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">General Consultation Room</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage your upcoming live session, review health timelines, and access medical records.</p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab('upcoming')}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'upcoming' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
            >
              Active Session
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
            >
              Consultation Timeline
            </button>
          </div>
        </div>

        {/* Mobile Segmented Tab Switcher */}
        <div className="flex md:hidden bg-slate-200/70 p-1 rounded-2xl mb-6">
          <button 
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'upcoming' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'}`}
          >
            Active Session
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'}`}
          >
            Timeline
          </button>
        </div>

        {/* TAB 1: UPCOMING / ACTIVE SESSION */}
        {activeTab === 'upcoming' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Hero Countdown & Action Banner */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-800 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-3 border border-blue-400/30">
                    <Clock className="w-3.5 h-3.5 animate-pulse" /> Starts in {formatTime(timeLeft)}
                  </div>
                  <h2 className="text-xl md:text-3xl font-black tracking-tight">Next Appointment: {consultationType} with {doctorName}</h2>
                  <p className="text-blue-200 text-xs md:text-sm mt-1 max-w-xl">
                    Your encrypted HD video link is prepared. Ensure your webcam and mic are ready before joining the virtual waiting room.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setInCall(true)}
                    className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3.5 rounded-2xl font-black text-sm shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Video className="w-4 h-4" /> Join Waiting Room / Call
                  </button>
                </div>
              </div>
            </div>

            {/* Booked Appointments List Section */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900">Your Booked Appointments List</h3>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                  {allAppointments.length} Total Bookings
                </span>
              </div>

              {loadingAppointment ? (
                <p className="text-xs text-slate-500 py-4 animate-pulse">Loading appointments from Supabase database...</p>
              ) : allAppointments.length === 0 ? (
                <p className="text-xs text-slate-500 py-4">No appointments booked yet. Visit the Doctor Directory to schedule a session.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allAppointments.map((appt) => {
                    const docInfo = appt.doctors;
                    const docN = docInfo?.name || appt.doctor_name || "Doctor Specialist";
                    const docS = docInfo?.specialty || docInfo?.department || "General Practice";
                    const isCurrentActive = latestAppointment?.id === appt.id;

                    return (
                      <div 
                        key={appt.id} 
                        className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                          isCurrentActive 
                            ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20 shadow-md' 
                            : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                              Ref: {appt.ref_code || (typeof appt.id === 'string' ? appt.id.slice(0, 8) : appt.id)}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isCurrentActive ? 'bg-blue-600 text-white' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {isCurrentActive ? 'Active Focus' : (appt.status || 'Confirmed')}
                            </span>
                          </div>

                          <h4 className="font-black text-slate-900 text-sm">{docN}</h4>
                          <p className="text-xs text-blue-600 font-semibold mb-3">{docS}</p>

                          <div className="space-y-1 text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-100 mb-4">
                            <p className="flex justify-between">
                              <span className="text-slate-400">Date:</span>
                              <span className="font-bold">{appt.appointment_date || appt.date}</span>
                            </p>
                            <p className="flex justify-between">
                              <span className="text-slate-400">Time:</span>
                              <span className="font-bold">{appt.start_time || appt.time}</span>
                            </p>
                            <p className="flex justify-between">
                              <span className="text-slate-400">Type:</span>
                              <span className="font-bold">{appt.consultation_type || appt.consultation_format || 'Telehealth'}</span>
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setLatestAppointment(appt);
                            if (appt.reason || appt.symptoms) {
                              setSymptomsInput(appt.reason || appt.symptoms);
                            }
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                            isCurrentActive 
                              ? 'bg-blue-600 text-white shadow-md' 
                              : 'bg-slate-900 hover:bg-slate-800 text-white'
                          }`}
                        >
                          {isCurrentActive ? 'Currently Viewing' : 'Switch to Session'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Grid Layout: Doctor Profile & Pre-Consultation requirements */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Col: Doctor & Appointment Specs */}
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned Physician</h3>
                    <Link 
                      href="/patient/dashboard/doctors" 
                      className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      Doctor Profile <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center text-blue-700 font-bold justify-center text-xl border border-blue-200 flex-shrink-0">
                      {getInitials(doctorName)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{doctorName}</h4>
                      <p className="text-xs text-blue-600 font-semibold">{doctorSpecialty}</p>
                      <div className="flex items-center gap-1 mt-1 text-amber-500 text-xs font-bold">
                        <span>★ {doctorRating}</span> <span className="text-slate-400 font-normal">(Verified)</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 space-y-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Date & Time:</span>
                      <span className="font-bold text-slate-800">{appointmentDateFormatted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Consultation Type:</span>
                      <span className="font-bold text-slate-800">{consultationType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Encryption:</span>
                      <span className="font-bold text-emerald-600 flex items-center gap-1">
                        <Shield className="w-3 h-3" /> End-to-End Secure
                      </span>
                    </div>
                  </div>
                </div>

                {/* Vitals Quick-Sync Card */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Vitals Sync</h3>
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div className="text-[10px] text-slate-400 font-medium">Blood Pressure</div>
                      <div className="text-sm font-black text-slate-800 mt-0.5">135/85 <span className="text-[10px] text-amber-600 font-normal">Elevated</span></div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div className="text-[10px] text-slate-400 font-medium">Heart Rate</div>
                      <div className="text-sm font-black text-slate-800 mt-0.5">72 <span className="text-[10px] text-slate-400 font-normal">bpm</span></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Col: Pre-Consultation Questionnaire & Uploads */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900 mb-1">Pre-Consultation Questionnaire</h3>
                  <p className="text-xs text-slate-500 mb-6">Help {doctorName} review your current symptoms and recent lab records prior to the call.</p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">Describe your symptoms or reason for visit today:</label>
                      <textarea 
                        rows={4}
                        value={symptomsInput}
                        onChange={(e) => setSymptomsInput(e.target.value)}
                        placeholder="e.g., Mild morning headaches, slight chest tightness when climbing stairs..."
                        className="w-full rounded-2xl border border-slate-200 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">Upload Recent Lab Reports, X-Rays, or Medical Files (Optional)</label>
                      <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-blue-500 transition-all cursor-pointer bg-slate-50">
                        <Upload className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-700">Click to upload or drag & drop files here</p>
                        <p className="text-[10px] text-slate-400 mt-1">PDF, PNG, JPG, or DICOM up to 25MB</p>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button 
                        onClick={handleSaveSymptoms}
                        disabled={isSubmitting}
                        className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-xs font-bold shadow-md shadow-blue-200 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {isSubmitting ? 'Saving to Database...' : 'Save & Submit Details'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CONSULTATION HISTORY / TIMELINE */}
        {activeTab === 'history' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Past Consultation Records & E-Prescriptions</h3>
              <p className="text-xs text-slate-500 mb-6">Review previous diagnoses, attached lab results, and secure doctor notes.</p>

              <div className="space-y-4">
                {consultationHistory.map((item) => (
                  <div key={item.id} className="p-5 rounded-2xl border border-slate-200/80 hover:border-slate-300 transition bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                          {item.id}
                        </span>
                        <span className="text-xs text-slate-400">• {item.date}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{item.doctor} <span className="text-xs font-normal text-slate-500">({item.specialty})</span></h4>
                      <p className="text-xs font-semibold text-slate-700">Diagnosis: {item.diagnosis}</p>
                      <p className="text-xs text-slate-500">Rx: {item.prescription}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => alert(`Downloading medical report and e-prescription for ${item.id}`)}
                        className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" /> Download PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MODAL / LIVE WEBCAM VIDEO ROOM */}
        {inCall && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col p-4 md:p-8 animate-fadeIn">
            {/* Top Video Header bar */}
            <div className="flex items-center justify-between text-white pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <div>
                  <h4 className="font-bold text-xs md:text-sm">Secure HD Video Call with {doctorName}</h4>
                  <p className="text-[10px] text-slate-400">Session ID: #MED-SEC-9921 • Encrypted AES-256</p>
                </div>
              </div>

              <button 
                onClick={() => alert("Emergency Alert Triggered! Hospital dispatch notified.")}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[10px] md:text-xs font-black shadow-lg shadow-red-900/50 flex items-center gap-1.5 cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" /> Emergency
              </button>
            </div>

            {/* Main Video Grid & AI Assistant Split */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 py-4 overflow-y-auto">
              {/* Video Streams */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 relative min-h-[300px]">
                {/* Doctor Video Box */}
                <div className="bg-slate-900 rounded-3xl border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl p-6">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-blue-600/30 border border-blue-400/40 flex items-center text-blue-300 font-bold text-2xl md:text-3xl mb-3 shadow-inner">
                    {getInitials(doctorName)}
                  </div>
                  <span className="text-white font-bold text-sm relative z-10">{doctorName}</span>
                  <span className="text-xs text-emerald-400 font-semibold relative z-10 mt-0.5">Connected (HD 1080p)</span>
                </div>

                {/* Patient Live Webcam Video Box */}
                <div className="bg-slate-900 rounded-3xl border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
                  {isVideoOff ? (
                    <div className="text-slate-500 text-xs font-bold">Camera Paused</div>
                  ) : (
                    <>
                      <video 
                        ref={patientVideoRef}
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-full object-cover rounded-3xl"
                      />
                      <div className="absolute bottom-3 left-3 bg-slate-900/80 px-3 py-1 rounded-lg text-[10px] text-white font-medium backdrop-blur-xs">
                        You (Patient View)
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Sidebar AI Assistant & Notes */}
              <div className="bg-slate-900 rounded-3xl border border-slate-800 p-4 text-white flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-xs mb-3 border-b border-slate-800 pb-2">
                    <SparklesIcon className="w-4 h-4 text-blue-400" />
                    <span>MedicareAI Scribe</span>
                  </div>
                  <div className="space-y-2">
                    {aiNotes.map((note, idx) => (
                      <div key={idx} className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/50 text-xs text-slate-300">
                        • {note}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-400">
                  Real-time clinical notes generated securely.
                </div>
              </div>
            </div>

            {/* Video Call Controls Bar */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-center gap-4">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3.5 rounded-2xl text-white transition cursor-pointer ${isMuted ? 'bg-red-600' : 'bg-slate-800 hover:bg-slate-700'}`}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button 
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`p-3.5 rounded-2xl text-white transition cursor-pointer ${isVideoOff ? 'bg-red-600' : 'bg-slate-800 hover:bg-slate-700'}`}
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
              </button>

              <button 
                onClick={() => setInCall(false)}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3.5 rounded-2xl font-bold text-xs shadow-lg shadow-red-900/50 flex items-center gap-2 cursor-pointer"
              >
                <PhoneOff className="w-4 h-4" /> End Call
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}