'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { supabase, Doctor, DoctorAvailability, Appointment } from '@/lib/supabase';
import { generateAvailableSlots, GeneratedTimeSlot } from '@/lib/slot-calculator';
import { submitBookingAction } from './actions';
import { PatientSidebar } from '@/components/PatientSidebar';
import { 
  ShieldCheck, Clock, CheckCircle2, Search, Star, Building, Video, Mic, 
  AlertTriangle, Calendar as CalendarIcon, MapPin, ChevronRight, Check,
  Activity, Heart, Brain, Baby, Sparkles, User, FileText, Download, MessageSquare
} from 'lucide-react';

// Web Speech API Types declaration
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

// Body System Cards Data
const BODY_SYSTEMS = [
  { id: 'General', label: 'General / Routine', icon: Activity, chips: ['Fever', 'Fatigue', 'Weight loss', 'Body aches'] },
  { id: 'Respiratory', label: 'Respiratory', icon: Activity, chips: ['Cough', 'Shortness of breath', 'Sore throat', 'Wheezing'] },
  { id: 'Cardiac', label: 'Cardiovascular', icon: Heart, chips: ['Chest discomfort', 'Palpitations', 'High BP', 'Swelling'] },
  { id: 'Mental Health', label: 'Mental Wellbeing', icon: Brain, chips: ['Anxiety', 'Sleep trouble', 'Mood shifts', 'Burnout'] },
  { id: 'Children', label: "Pediatrics", icon: Baby, chips: ['Growth check', 'Fever in child', 'Skin rash', 'Ear pain'] },
];

export default function SwiftMDBookingExperience() {
  const [step, setStep] = useState<number>(1);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('All');

  // Schedule & Realtime State
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [availabilities, setAvailabilities] = useState<Record<string, DoctorAvailability>>({});
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<GeneratedTimeSlot | null>(null);
  const [consultationType, setConsultationType] = useState<'Physical' | 'Telehealth'>('Physical');

  // Clinical Details State
  const [selectedBodySystem, setSelectedBodySystem] = useState<string>('General');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [painLevel, setPainLevel] = useState<number>(3);
  const [reason, setReason] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);

  // Status & Confirmation
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmedBooking, setConfirmedBooking] = useState<{ refCode: string; date: string; time: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Initial Doctor Load
  useEffect(() => {
    async function fetchDoctors() {
      setIsLoading(true);
      const { data } = await supabase.from('doctors').select('*').order('rating', { ascending: false });
      if (data && data.length > 0) {
        setDoctors(data);
        setSelectedDoctor(data[0]);
      }
      setIsLoading(false);
    }
    fetchDoctors();
  }, []);

  // 2. Load Schedule & Realtime Subscription for Selected Doctor
  useEffect(() => {
    if (!selectedDoctor) return;

    async function loadDoctorSchedule() {
      const [availRes, apptRes] = await Promise.all([
        supabase.from('doctor_availability').select('*').eq('doctor_id', selectedDoctor.id).gte('date', todayStr),
        supabase.from('appointments').select('*').eq('doctor_id', selectedDoctor.id).gte('appointment_date', todayStr)
      ]);

      if (availRes.data) {
        const map: Record<string, DoctorAvailability> = {};
        availRes.data.forEach((item: DoctorAvailability) => { map[item.date] = item; });
        setAvailabilities(map);
      }

      if (apptRes.data) {
        setAppointments(apptRes.data as Appointment[]);
      }
    }

    loadDoctorSchedule();

    // Realtime Availability Sync
    const availChan = supabase
      .channel(`avail-${selectedDoctor.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'doctor_availability', filter: `doctor_id=eq.${selectedDoctor.id}` }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const row = payload.new as DoctorAvailability;
          if (row && row.date) setAvailabilities(prev => ({ ...prev, [row.date]: row }));
        } else if (payload.eventType === 'DELETE') {
          const old = payload.old as { date?: string };
          if (old?.date) setAvailabilities(prev => { const copy = { ...prev }; delete copy[old.date!]; return copy; });
        }
      })
      .subscribe();

    // Realtime Appointments Sync
    const apptChan = supabase
      .channel(`appts-${selectedDoctor.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments', filter: `doctor_id=eq.${selectedDoctor.id}` }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const appt = payload.new as Appointment;
          if (appt) {
            setAppointments(prev => {
              const idx = prev.findIndex(a => a.id === appt.id);
              if (idx > -1) { const copy = [...prev]; copy[idx] = appt; return copy; }
              return [...prev, appt];
            });
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(availChan);
      supabase.removeChannel(apptChan);
    };
  }, [selectedDoctor, todayStr]);

  // Dynamic Computations
  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = doc.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || doc.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpec = specialtyFilter === 'All' || doc.specialty === specialtyFilter;
    return matchesSearch && matchesSpec;
  });

  const currentAvailability = availabilities[selectedDate] || null;
  const dayAppointments = appointments.filter(a => a.appointment_date === selectedDate);
  const timeSlots = generateAvailableSlots(currentAvailability, dayAppointments);

  const toggleSymptom = (chip: string) => {
    setSelectedSymptoms(prev => prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]);
  };

  // Voice to Text Integration
  const handleVoiceInput = () => {
    if (typeof window === 'undefined') return;
    const win = window as unknown as IWindow;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice dictation is supported in Chrome/Edge.');
      return;
    }

    setIsListening(true);
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setReason(prev => (prev ? `${prev} ${transcript}` : transcript));
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.start();
  };

  // Submit Booking Transaction
  const handleFinalBooking = async () => {
    if (!selectedDoctor || !selectedSlot || !selectedDate) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    const refCode = `SMD-${Math.floor(100000 + Math.random() * 900000)}`;

    const res = await submitBookingAction({
      doctorId: selectedDoctor.id,
      patientId: '22222222-2222-2222-2222-222222222222',
      patientName: 'Sarah Jenkins',
      appointmentDate: selectedDate,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      consultationType,
      bodySystem: selectedBodySystem,
      symptoms: selectedSymptoms,
      painLevel,
      reason,
      refCode,
    });

    setIsSubmitting(false);

    if (res.success) {
      setConfirmedBooking({ refCode, date: selectedDate, time: selectedSlot.startTime });
      setStep(4);
    } else {
      setErrorMessage(res.error || 'Failed to complete reservation.');
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#050914] text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      <PatientSidebar />

      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full space-y-6">
        
        {/* HERO SECTION */}
        <div className="bg-gradient-to-r from-blue-950/60 via-[#0a1228] to-[#080d1a] border border-blue-800/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 rounded-full bg-blue-900/50 border border-blue-600/40 text-[10px] font-bold text-blue-300 uppercase tracking-widest flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-blue-400" /> 256-Bit Encrypted
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold">
                  <Clock className="w-3 h-3 text-emerald-400" /> ~2 min booking time
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Book an Appointment</h1>
              <p className="text-xs text-slate-400 mt-1">Choose a doctor, select an available time, and confirm your consultation.</p>
            </div>

            {/* Stepper Progress Indicator */}
            {step < 4 && (
              <div className="flex items-center gap-2 bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800/80">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${
                      step === s ? 'bg-blue-600 text-white ring-2 ring-blue-400/40 shadow-lg' : step > s ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-900 text-slate-600'
                    }`}>
                      {step > s ? <Check className="w-4 h-4" /> : s}
                    </div>
                    {s < 3 && <div className={`w-6 h-0.5 rounded ${step > s ? 'bg-emerald-500' : 'bg-slate-800'}`}></div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            {errorMessage}
          </div>
        )}

        {/* STEP 1: CHOOSE DOCTOR */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search doctor name or specialty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0d1424] border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                {['All', 'Cardiology', 'General Medicine', 'Pediatrics', 'Neurology'].map((spec) => (
                  <button
                    key={spec}
                    onClick={() => setSpecialtyFilter(spec)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                      specialtyFilter === spec ? 'bg-blue-600 text-white' : 'bg-[#0d1424] text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>

            {/* Doctor Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDoctors.map((doc) => {
                const isSelected = selectedDoctor?.id === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoctor(doc)}
                    className={`p-5 rounded-3xl border transition cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'bg-gradient-to-b from-[#0d1a38] to-[#0a1226] border-blue-500 shadow-xl shadow-blue-600/10'
                        : 'bg-[#0d1424] border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="relative shrink-0">
                        <div className="w-14 h-14 rounded-2xl bg-blue-950 border border-blue-500/30 flex items-center justify-center font-bold text-blue-300 text-lg">
                          {doc.full_name.split(' ').map(n=>n[0]).join('')}
                        </div>
                        {doc.is_online && (
                          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[#0d1424] rounded-full"></span>
                        )}
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-white text-sm">{doc.full_name}</h3>
                          <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-800/40">
                            <Star className="w-3 h-3 fill-amber-400" /> {doc.rating}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-blue-400">{doc.specialty}</p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-slate-500" /> {doc.hospital_affiliation}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Consultation Fee</span>
                        <span className="font-black text-white">KES {doc.consultation_fee}</span>
                        {doc.sha_covered && <span className="ml-1.5 text-[9px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-800/40">SHA Covered</span>}
                      </div>

                      <button
                        onClick={() => { setSelectedDoctor(doc); setStep(2); }}
                        className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                          isSelected ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        Select Doctor <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: LIVE CALENDAR & REAL TIME SELECTION */}
        {step === 2 && selectedDoctor && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in">
            {/* Dates List */}
            <div className="md:col-span-5 bg-[#0d1424] border border-slate-800 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-blue-400" /> Doctor Availability
                </h2>
                <button onClick={() => setStep(1)} className="text-[11px] text-blue-400 hover:underline">Change Doctor</button>
              </div>

              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {Array.from({ length: 14 }).map((_, i) => {
                  const dateObj = new Date();
                  dateObj.setDate(dateObj.getDate() + i);
                  const dStr = dateObj.toISOString().split('T')[0];
                  const avail = availabilities[dStr];
                  const status = avail?.status || 'Available';
                  const isDisabled = ['Off Duty', 'Leave', 'Holiday', 'Fully Booked'].includes(status);

                  return (
                    <button
                      key={dStr}
                      disabled={isDisabled}
                      onClick={() => { setSelectedDate(dStr); setSelectedSlot(null); }}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition ${
                        selectedDate === dStr
                          ? 'bg-blue-600 border-blue-500 text-white shadow-lg'
                          : isDisabled
                          ? 'bg-slate-950/40 border-slate-900 text-slate-600 cursor-not-allowed'
                          : 'bg-slate-900/80 border-slate-800 text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold">{dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                        <p className="text-[10px] opacity-75">{avail ? `${avail.start_time.slice(0,5)} - ${avail.end_time.slice(0,5)}` : '08:00 - 17:00'}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isDisabled ? 'bg-neutral-900 text-neutral-500' : 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                      }`}>
                        {status}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slot Selector */}
            <div className="md:col-span-7 bg-[#0d1424] border border-slate-800 rounded-3xl p-5 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" /> Real Time Slots ({selectedDate})
                </h2>
                <span className="text-[10px] text-slate-400">
                  {timeSlots.filter(s=>!s.isBooked).length} slots remaining
                </span>
              </div>

              {/* Consultation Type Selector */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setConsultationType('Physical')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                    consultationType === 'Physical' ? 'bg-blue-950 border-blue-600 text-blue-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <Building className="w-4 h-4" /> Physical In-Clinic
                </button>
                <button
                  type="button"
                  onClick={() => setConsultationType('Telehealth')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                    consultationType === 'Telehealth' ? 'bg-purple-950 border-purple-600 text-purple-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <Video className="w-4 h-4" /> Telehealth Video
                </button>
              </div>

              {timeSlots.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 italic bg-slate-950/40 rounded-2xl border border-slate-900">
                  No slots available for this date.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.startTime}
                      disabled={slot.isBooked}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center ${
                        slot.isBooked
                          ? 'bg-slate-950 border-slate-900 text-slate-600 line-through cursor-not-allowed'
                          : selectedSlot?.startTime === slot.startTime
                          ? 'bg-blue-600 border-blue-400 text-white ring-2 ring-blue-400/50 shadow-lg'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span>{slot.startTime}</span>
                      <span className="text-[9px] opacity-60 font-normal">{slot.isBooked ? 'Booked' : slot.endTime}</span>
                    </button>
                  ))}
                </div>
              )}

              <div className="flex justify-between pt-4 border-t border-slate-800">
                <button onClick={() => setStep(1)} className="px-4 py-2.5 rounded-xl bg-slate-900 text-slate-300 text-xs font-bold">Back</button>
                <button
                  disabled={!selectedSlot}
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-xs shadow-lg transition"
                >
                  Continue to Symptoms
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: CLINICAL SYMPTOMS & SUMMARY */}
        {step === 3 && selectedDoctor && selectedSlot && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in">
            {/* Symptoms Input Form (7 Cols) */}
            <div className="md:col-span-7 space-y-5 bg-[#0d1424] border border-slate-800 rounded-3xl p-6">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Clinical Intake</h2>
                <p className="text-xs text-slate-400 mt-0.5">Help Dr. {selectedDoctor.full_name} prepare for your session.</p>
              </div>

              {/* Body System Icon Cards */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Select Primary Body System</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {BODY_SYSTEMS.map((sys) => {
                    const Icon = sys.icon;
                    const isSel = selectedBodySystem === sys.id;
                    return (
                      <button
                        key={sys.id}
                        type="button"
                        onClick={() => { setSelectedBodySystem(sys.id); setSelectedSymptoms([]); }}
                        className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 ${
                          isSel ? 'bg-blue-950 border-blue-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isSel ? 'text-blue-400' : 'text-slate-500'}`} />
                        <span className="text-xs font-bold truncate">{sys.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Symptom Chips */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Symptom Chips</label>
                <div className="flex flex-wrap gap-2">
                  {BODY_SYSTEMS.find(b => b.id === selectedBodySystem)?.chips.map((chip) => {
                    const active = selectedSymptoms.includes(chip);
                    return (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => toggleSymptom(chip)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                          active ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {chip}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pain Level Indicator */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-slate-300">Pain Scale (1 - 10)</label>
                  <span className="font-bold text-amber-400 text-sm">{painLevel} / 10</span>
                </div>
                <input
                  type="range" min="1" max="10" value={painLevel}
                  onChange={(e) => setPainLevel(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              {/* Reason For Visit with Voice Dictation */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-slate-300">Reason for Visit</label>
                  <button
                    type="button" onClick={handleVoiceInput}
                    className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg border ${
                      isListening ? 'bg-rose-950 border-rose-600 text-rose-300 animate-pulse' : 'bg-slate-900 border-slate-800 text-blue-400'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5" /> {isListening ? 'Listening...' : 'Voice Dictate'}
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe your symptoms or reason for booking..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>

              {/* Smart Clinical Suggestion Card */}
              {painLevel >= 7 && (
                <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-800/60 flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-200">
                    <strong>Smart Clinical Trigger:</strong> High pain score recorded. Consider emergency in-clinic triage if severe.
                  </p>
                </div>
              )}
            </div>

            {/* Sticky Summary Card (5 Cols) */}
            <div className="md:col-span-5 space-y-4">
              <div className="bg-[#0d1424] border border-slate-800 rounded-3xl p-6 space-y-4 sticky top-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Booking Summary</h3>

                <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                  <div className="w-12 h-12 rounded-xl bg-blue-950 border border-blue-600/30 flex items-center justify-center font-bold text-blue-300">
                    {selectedDoctor.full_name.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{selectedDoctor.full_name}</h4>
                    <p className="text-[10px] text-blue-400">{selectedDoctor.specialty}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Date & Time:</span>
                    <strong className="text-white">{selectedDate} @ {selectedSlot.startTime}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Type:</span>
                    <strong className="text-white">{consultationType}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Consultation Fee:</span>
                    <strong className="text-white">KES {selectedDoctor.consultation_fee}</strong>
                  </div>
                </div>

                <button
                  onClick={handleFinalBooking}
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-slate-950 font-black text-xs rounded-2xl shadow-xl transition flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Syncing Supabase...' : 'Confirm & Reserve Slot'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: CONFIRMATION EXPERIENCE */}
        {step === 4 && confirmedBooking && selectedDoctor && (
          <div className="max-w-2xl mx-auto bg-[#0d1424] border border-slate-800 rounded-3xl p-8 text-center space-y-6 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-2xl">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-xl font-black text-white">Consultation Reserved!</h2>
              <p className="text-xs text-slate-400 mt-1">Reference Code: <strong className="font-mono text-blue-400">{confirmedBooking.refCode}</strong></p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-left space-y-2">
              <div className="flex justify-between"><span className="text-slate-400">Doctor:</span> <span className="font-bold text-white">{selectedDoctor.full_name}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Schedule:</span> <span className="font-bold text-white">{confirmedBooking.date} at {confirmedBooking.time}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Type:</span> <span className="font-bold text-white">{consultationType}</span></div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button 
                onClick={() => window.print()} 
                className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs flex items-center gap-2 hover:bg-slate-800 transition"
              >
                <Download className="w-4 h-4" /> Download Slip
              </button>
              <button 
                onClick={() => setStep(1)} 
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition"
              >
                Book Another Appointment
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}