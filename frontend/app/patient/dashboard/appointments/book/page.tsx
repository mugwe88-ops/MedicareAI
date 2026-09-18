'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, Doctor, DoctorAvailability, Appointment } from '@/lib/supabase';
import { generateAvailableSlots, GeneratedTimeSlot } from '@/lib/slot-calculator';
import { createPatientBookingAction } from './actions';
import {
  ShieldCheck, Clock, CheckCircle2, Search, Star, Building, Video, Mic,
  AlertTriangle, Calendar as CalendarIcon, ChevronRight, Check,
  Activity, Heart, Brain, Baby, Stethoscope, ArrowLeft, User, RefreshCw,
  Zap, X
} from 'lucide-react';

interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

const BODY_SYSTEMS = [
  { id: 'General', label: 'General / Systemic', icon: Activity, chips: ['Fever', 'Fatigue', 'Weight loss', 'Body aches'] },
  { id: 'Respiratory', label: 'Respiratory', icon: Stethoscope, chips: ['Cough', 'Shortness of breath', 'Sore throat', 'Wheezing'] },
  { id: 'Cardiac', label: 'Cardiovascular', icon: Heart, chips: ['Chest discomfort', 'Palpitations', 'High BP', 'Swelling'] },
  { id: 'Mental Health', label: 'Mental Wellbeing', icon: Brain, chips: ['Anxiety', 'Sleep trouble', 'Mood shifts', 'Burnout'] },
  { id: 'Children', label: 'Pediatrics', icon: Baby, chips: ['Growth check', 'Fever in child', 'Skin rash', 'Ear pain'] },
];

const SPECIALTIES = ['All', 'General Practice', 'Cardiology', 'Pediatrics', 'Neurology', 'Dermatology', "Women's Health", 'Orthopedics', 'ENT', 'Ophthalmology', 'Psychiatry', 'Gastroenterology', 'Endocrinology', 'Urology', 'Rheumatology', 'Pulmonology', 'Nephrology', 'Oncology'
];

/* INLINE COMPONENT 1: BOOKING HERO */
function BookingHero({ patientName = 'Patient', step }: { patientName?: string; step: number }) {
  return (
    <div className="bg-gradient-to-r from-blue-950/90 via-[#0a1228] to-[#080d1a] border border-blue-800/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-full bg-blue-900/60 border border-blue-500/40 text-[10px] font-bold text-blue-300 uppercase tracking-widest flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> 256-Bit Encrypted
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-950/50 border border-emerald-800/50 text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 animate-pulse" /> Live Sync Active
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[10px] text-slate-400 flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> Est. Booking: &lt; 2 mins
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Welcome back, {patientName}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Book your medical consultation with top-tier physicians in under 2 minutes.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80 shrink-0">
          {[
            { num: 1, label: 'Doctor' },
            { num: 2, label: 'Schedule' },
            { num: 3, label: 'Intake' },
          ].map((s, i) => (
            <React.Fragment key={s.num}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${
                    step === s.num
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50 ring-2 ring-blue-400/40'
                      : step > s.num
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-slate-900 text-slate-600'
                  }`}
                >
                  {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                </div>
                <span className={`text-[10px] font-bold hidden sm:inline ${step === s.num ? 'text-white' : 'text-slate-500'}`}>
                  {s.label}
                </span>
              </div>
              {i < 2 && <div className={`w-4 h-0.5 ${step > i + 1 ? 'bg-emerald-500' : 'bg-slate-800'}`} />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

/* INLINE COMPONENT 2: FEATURED DOCTORS CAROUSEL */
function FeaturedDoctors({
  doctors,
  selectedDoctorId,
  onSelectDoctor,
}: {
  doctors: Doctor[];
  selectedDoctorId?: string;
  onSelectDoctor: (doc: Doctor) => void;
}) {
  if (!doctors || doctors.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" /> Featured Physicians Available Today
        </h2>
        <span className="text-[10px] text-blue-400 font-bold">Top Verified Ratings</span>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-blue-600/30">
        {doctors.slice(0, 5).map((doc) => {
          const isSelected = selectedDoctorId === doc.id;
          return (
            <div
              key={`feat-${doc.id}`}
              onClick={() => onSelectDoctor(doc)}
              className={`min-w-[240px] sm:min-w-[260px] p-4 rounded-2xl border transition-all cursor-pointer group shrink-0 ${
                isSelected
                  ? 'bg-blue-950/80 border-blue-500 ring-1 ring-blue-500'
                  : 'bg-[#0d1424] border-slate-800/80 hover:border-blue-500/50 hover:-translate-y-1'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-950 border border-blue-500/30 flex items-center justify-center font-bold text-blue-300 text-xs shrink-0 group-hover:scale-105 transition-transform">
                  {doc.full_name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold text-white truncate flex items-center gap-1">
                    {doc.full_name} <CheckCircle2 className="w-3 h-3 text-blue-400 shrink-0" />
                  </h4>
                  <p className="text-[10px] text-blue-400 truncate">{doc.specialty}</p>
                  <div className="flex items-center gap-1 text-[9px] text-amber-400 font-bold mt-0.5">
                    <Star className="w-3 h-3 fill-amber-400" /> {doc.rating || '4.9'}
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Video className="w-3 h-3" /> Telehealth Ready
                </span>
                <span className="font-bold text-slate-200">KES {doc.consultation_fee || 3500}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* INLINE COMPONENT 3: DOCTOR CARD */
function DoctorCard({
  doctor,
  isSelected,
  onSelect,
  onProceed,
}: {
  doctor: Doctor;
  isSelected: boolean;
  onSelect: (doc: Doctor) => void;
  onProceed: (doc: Doctor) => void;
}) {
  return (
    <div
      onClick={() => onSelect(doctor)}
      className={`p-5 rounded-3xl border transition-all duration-300 cursor-pointer relative overflow-hidden group ${
        isSelected
          ? 'bg-gradient-to-b from-[#0d1a38] to-[#0a1226] border-blue-500 shadow-xl shadow-blue-950/50 ring-1 ring-blue-500/50'
          : 'bg-[#0d1424] border-slate-800/80 hover:border-slate-700 hover:-translate-y-1'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-950 border border-blue-500/30 flex items-center justify-center font-bold text-blue-300 text-lg shrink-0 shadow-lg group-hover:scale-105 transition-transform">
          {doctor.full_name.split(' ').map((n) => n[0]).join('')}
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
              {doctor.full_name}
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            </h3>
            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-800/40">
              <Star className="w-3 h-3 fill-amber-400" /> {doctor.rating || '4.9'}
            </span>
          </div>
          <p className="text-xs font-semibold text-blue-400">{doctor.specialty}</p>
          <p className="text-[10px] text-slate-400 flex items-center gap-1">
            <Building className="w-3 h-3 text-slate-500" /> {(doctor as any).location || 'Swift MD Central Clinic'}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className="px-2 py-0.5 rounded-md bg-emerald-950/50 border border-emerald-800/40 text-[9px] font-bold text-emerald-400 flex items-center gap-1">
          <Video className="w-3 h-3" /> Telehealth
        </span>
        <span className="px-2 py-0.5 rounded-md bg-blue-950/50 border border-blue-800/40 text-[9px] font-bold text-blue-300 flex items-center gap-1">
          <Building className="w-3 h-3" /> In-Clinic
        </span>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <div>
          <span className="text-[10px] text-slate-500 block uppercase font-bold">Consultation Fee</span>
          <span className="font-black text-white text-sm">KES {doctor.consultation_fee || 3500}</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onProceed(doctor);
          }}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition flex items-center gap-1"
        >
          Select Doctor <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/* INLINE COMPONENT 4: EMPTY STATE */
function EmptyState({
  title,
  description,
  onClearFilters,
}: {
  title: string;
  description: string;
  onClearFilters: () => void;
}) {
  return (
    <div className="p-10 rounded-3xl bg-[#0d1424] border border-slate-800/80 text-center space-y-4 shadow-xl">
      <div className="w-16 h-16 rounded-full bg-blue-950/60 border border-blue-800/40 flex items-center justify-center mx-auto text-blue-400">
        <User className="w-8 h-8" />
      </div>
      <div className="max-w-md mx-auto space-y-1">
        <h3 className="text-base font-bold text-white">{title}</h3>
        <p className="text-xs text-slate-400">{description}</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        <button
          onClick={onClearFilters}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reset Filters
        </button>
      </div>
    </div>
  );
}

/* MAIN PAGE EXPORT */
export default function BookAppointmentPage() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('All');

  const [todayStr, setTodayStr] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availabilities, setAvailabilities] = useState<Record<string, DoctorAvailability>>({});
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<GeneratedTimeSlot | null>(null);
  const [consultationType, setConsultationType] = useState<'Telehealth' | 'Physical'>('Telehealth');

  const [selectedBodySystem, setSelectedBodySystem] = useState<string>('General');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [painLevel, setPainLevel] = useState<number>(3);
  const [reason, setReason] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setTodayStr(today);
    setSelectedDate(today);
  }, []);

  // UPDATED fetchDoctors() WITH AUTOMATIC SAMPLE FALLBACK DATA
  useEffect(() => {
    async function fetchDoctors() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .order('rating', { ascending: false });

      if (!error && data && data.length > 0) {
        setDoctors(data as Doctor[]);
        setSelectedDoctor(data[0] as Doctor);
      } else {
        // Fallback sample doctors if Supabase table is empty
        const fallbackDoctors: any[] = [
          {
            id: '11111111-1111-1111-1111-111111111111',
            full_name: 'Dr. Evelyn Harper',
            specialty: 'General Practice',
            consultation_fee: 3500,
            rating: 4.9,
            location: 'Swift MD Central Clinic',
          },
          {
            id: '22222222-2222-2222-2222-222222222222',
            full_name: 'Dr. Marcus Vance',
            specialty: 'Cardiology',
            consultation_fee: 4500,
            rating: 4.8,
            location: 'Heart & Vascular Suite B',
          },
          {
            id: '33333333-3333-3333-3333-333333333333',
            full_name: 'Dr. Amara Patel',
            specialty: 'Pediatrics',
            consultation_fee: 3000,
            rating: 5.0,
            location: 'Pediatric Care Center',
          },
          {
            id: '44444444-4444-4444-4444-444444444444',
            full_name: 'Dr. Lucas Hayes',
            specialty: 'Neurology',
            consultation_fee: 5000,
            rating: 4.9,
            location: 'Neuroscience Center',
          },
          {
            id: '55555555-5555-5555-5555-555555555555',
            full_name: 'Dr. Sophia Chen',
            specialty: 'Dermatology',
            consultation_fee: 4000,
            rating: 4.7,
            location: 'DermaCare Institute',
          },
        ];
        setDoctors(fallbackDoctors);
        setSelectedDoctor(fallbackDoctors[0]);
      }
      setIsLoading(false);
    }
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (!selectedDoctor || !todayStr) return;

    const doctorId = selectedDoctor.id;

    async function loadDoctorSchedule() {
      const [availRes, apptRes] = await Promise.all([
        supabase.from('doctor_availability').select('*').eq('doctor_id', doctorId).gte('date', todayStr),
        supabase.from('appointments').select('*').eq('doctor_id', doctorId).gte('appointment_date', todayStr),
      ]);

      if (availRes.data) {
        const map: Record<string, DoctorAvailability> = {};
        availRes.data.forEach((item: DoctorAvailability) => {
          map[item.date] = item;
        });
        setAvailabilities(map);
      }

      if (apptRes.data) {
        setAppointments(apptRes.data as Appointment[]);
      }
    }

    loadDoctorSchedule();

    const availChan = supabase
      .channel(`avail-${doctorId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'doctor_availability', filter: `doctor_id=eq.${doctorId}` }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const row = payload.new as DoctorAvailability;
          if (row?.date) setAvailabilities((prev) => ({ ...prev, [row.date]: row }));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(availChan);
    };
  }, [selectedDoctor, todayStr]);

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpec = specialtyFilter === 'All' || doc.specialty === specialtyFilter;
    return matchesSearch && matchesSpec;
  });

  const currentAvailability = availabilities[selectedDate] || null;
  const dayAppointments = appointments.filter((a) => a.appointment_date === selectedDate);
  const timeSlots = generateAvailableSlots(currentAvailability, dayAppointments);

  const toggleSymptom = (chip: string) => {
    setSelectedSymptoms((prev) => (prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]));
  };

  const handleVoiceInput = () => {
    if (typeof window === 'undefined') return;
    const win = window as unknown as IWindow;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice dictation is supported in Chrome or Edge browsers.');
      return;
    }

    setIsListening(true);
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setReason((prev) => (prev ? `${prev} ${transcript}` : transcript));
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.start();
  };

  const handleFinalBooking = async () => {
    if (!selectedDoctor || !selectedSlot || !selectedDate) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    const refCode = `SMD-${Math.floor(100000 + Math.random() * 900000)}`;

    const res = await createPatientBookingAction({
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
      router.push('/patient/dashboard/appointments');
    } else {
      setErrorMessage(res.error || 'Failed to reserve appointment slot.');
    }
  };

  return (
    <div className="min-h-screen bg-[#050914] text-slate-100 font-sans p-4 md:p-8 space-y-6 pb-24 selection:bg-blue-600 selection:text-white rounded-3xl">
      
      {/* 1. HERO SECTION */}
      <BookingHero patientName="Sarah" step={step} />

      {/* ERROR NOTICE */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          {errorMessage}
        </div>
      )}

      {/* STEP 1: DOCTOR SEARCH & GRID */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search doctor name or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-[#0d1424] border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-blue-500 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-3.5 text-slate-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
              {SPECIALTIES.map((spec) => (
                <button
                  key={spec}
                  onClick={() => setSpecialtyFilter(spec)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    specialtyFilter === spec
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'bg-[#0d1424] text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>

          <FeaturedDoctors
            doctors={doctors}
            selectedDoctorId={selectedDoctor?.id}
            onSelectDoctor={(doc) => {
              setSelectedDoctor(doc);
              setStep(2);
            }}
          />

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-5 rounded-3xl bg-[#0d1424] border border-slate-800 animate-pulse h-36" />
              ))}
            </div>
          ) : filteredDoctors.length === 0 ? (
            <EmptyState
              title="We couldn't find an exact doctor match."
              description="Try adjusting your query or resetting specialty filters to see all available clinical specialists."
              onClearFilters={() => {
                setSearchQuery('');
                setSpecialtyFilter('All');
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDoctors.map((doc) => (
                <DoctorCard
                  key={doc.id}
                  doctor={doc}
                  isSelected={selectedDoctor?.id === doc.id}
                  onSelect={(d) => setSelectedDoctor(d)}
                  onProceed={(d) => {
                    setSelectedDoctor(d);
                    setStep(2);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* STEP 2: SCHEDULE & TIME SLOTS */}
      {step === 2 && selectedDoctor && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-5 bg-[#0d1424] border border-slate-800 rounded-3xl p-5 space-y-5">
            <div>
              <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 mb-3">
                <Video className="w-4 h-4 text-blue-400" /> Consultation Format
              </h2>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
                <button
                  onClick={() => setConsultationType('Telehealth')}
                  className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    consultationType === 'Telehealth' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" /> Telehealth
                </button>
                <button
                  onClick={() => setConsultationType('Physical')}
                  className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    consultationType === 'Physical' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  In-Clinic
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-blue-400" /> Select Date
              </h2>
              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {Array.from({ length: 14 }).map((_, i) => {
                  const dateObj = new Date();
                  dateObj.setDate(dateObj.getDate() + i);
                  const dStr = dateObj.toISOString().split('T')[0];
                  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                  const formattedStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                  return (
                    <button
                      key={dStr}
                      onClick={() => {
                        setSelectedDate(dStr);
                        setSelectedSlot(null);
                      }}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between text-xs font-bold transition ${
                        selectedDate === dStr
                          ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span>{dayName}, {formattedStr}</span>
                      <span className="text-[10px] opacity-75">{dStr}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="md:col-span-7 bg-[#0d1424] border border-slate-800 rounded-3xl p-5 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" /> Available Time Slots
                </h2>
                <span className="text-[10px] text-slate-400 font-semibold">{selectedDate}</span>
              </div>

              {timeSlots.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-slate-950/40 rounded-2xl border border-slate-800/80">
                  No available appointment slots on this date. Select another date above.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.startTime}
                      disabled={slot.isBooked}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1 ${
                        slot.isBooked
                          ? 'bg-slate-950 text-slate-600 border-slate-900 line-through cursor-not-allowed'
                          : selectedSlot?.startTime === slot.startTime
                          ? 'bg-blue-600 text-white border-blue-400 shadow-lg ring-2 ring-blue-400/40'
                          : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-blue-500/50'
                      }`}
                    >
                      <span>{slot.startTime}</span>
                      <span className="text-[9px] opacity-70">{slot.endTime}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-800 transition flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                disabled={!selectedSlot}
                onClick={() => setStep(3)}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-xs shadow-lg transition flex items-center gap-1"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: CLINICAL INTAKE & CONFIRMATION */}
      {step === 3 && selectedDoctor && selectedSlot && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 bg-[#0d1424] border border-slate-800 rounded-3xl p-6 space-y-5">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-blue-400" /> Clinical Intake & Symptoms
            </h2>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Primary Body System
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {BODY_SYSTEMS.map((sys) => {
                  const Icon = sys.icon;
                  const isSelected = selectedBodySystem === sys.id;
                  return (
                    <button
                      key={sys.id}
                      onClick={() => setSelectedBodySystem(sys.id)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center gap-2 ${
                        isSelected
                          ? 'bg-blue-900/60 border-blue-500 text-blue-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{sys.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Common Symptoms
              </label>
              <div className="flex flex-wrap gap-1.5">
                {BODY_SYSTEMS.find((s) => s.id === selectedBodySystem)?.chips.map((chip) => {
                  const active = selectedSymptoms.includes(chip);
                  return (
                    <button
                      key={chip}
                      onClick={() => toggleSymptom(chip)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition ${
                        active
                          ? 'bg-blue-600 text-white border-blue-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {chip}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Discomfort / Pain Level
                </label>
                <span className="text-xs font-black text-amber-400">{painLevel} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={painLevel}
                onChange={(e) => setPainLevel(parseInt(e.target.value))}
                className="w-full accent-blue-600 bg-slate-950 h-2 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Reason for Visit
                </label>
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition flex items-center gap-1 ${
                    isListening ? 'bg-rose-600 text-white border-rose-400 animate-pulse' : 'bg-slate-900 border-slate-800 text-blue-400'
                  }`}
                >
                  <Mic className="w-3 h-3" /> {isListening ? 'Listening...' : 'Voice Dictation'}
                </button>
              </div>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe your primary health concerns or questions for the physician..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="md:col-span-5 bg-[#0d1424] border border-slate-800 rounded-3xl p-6 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Booking Overview
              </h3>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-600/30 flex items-center justify-center font-bold text-blue-300 text-xs shrink-0">
                    {selectedDoctor.full_name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{selectedDoctor.full_name}</h4>
                    <p className="text-[10px] text-blue-400">{selectedDoctor.specialty}</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date:</span>
                    <span className="font-bold text-white">{selectedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Time:</span>
                    <span className="font-bold text-white">{selectedSlot.startTime} - {selectedSlot.endTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Format:</span>
                    <span className="font-bold text-emerald-400">{consultationType}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800/80 pt-2 text-sm">
                    <span className="font-bold text-slate-300">Total Fee:</span>
                    <span className="font-black text-white">KES {selectedDoctor.consultation_fee || 3500}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <button
                onClick={handleFinalBooking}
                disabled={isSubmitting}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-slate-950 font-black text-xs rounded-2xl shadow-xl transition flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span className="animate-pulse">Syncing Reservation...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Confirm & Reserve Appointment
                  </>
                )}
              </button>

              <button
                onClick={() => setStep(2)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 font-bold text-xs rounded-xl border border-slate-800 transition"
              >
                Modify Slot Selection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}