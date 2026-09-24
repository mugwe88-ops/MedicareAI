'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase, Doctor, DoctorAvailability, Appointment } from '@/lib/supabase';
import { generateAvailableSlots, GeneratedTimeSlot } from '@/lib/slot-calculator';
import { createPatientBookingAction } from './actions';
import {
  ShieldCheck, Clock, CheckCircle2, Search, Star, Building, Video,
  AlertTriangle, Calendar as CalendarIcon, ChevronRight, Check,
  Activity, Heart, Brain, Baby, Stethoscope, ArrowLeft, RefreshCw,
  Zap, X, Mic, Loader2
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

const SPECIALTIES = ['All', 'General Practice', 'Cardiology', 'Pediatrics', 'Neurology', 'Dermatology', "Women's Health"];

const getDoctorName = (doc: any) => doc?.display_name || doc?.full_name || doc?.name || 'Dr. Medical Specialist';
const getDoctorSpecialty = (doc: any) => doc?.specialization || doc?.specialty || 'General Practice';

function formatDateToYYYYMMDD(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function normalizeDateString(rawDate: any): string {
  if (!rawDate) return '';
  if (typeof rawDate === 'string') {
    return rawDate.split('T')[0].trim();
  }
  if (rawDate instanceof Date) {
    return formatDateToYYYYMMDD(rawDate);
  }
  return String(rawDate).split('T')[0].trim();
}

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
          const docName = getDoctorName(doc);
          const docSpec = getDoctorSpecialty(doc);
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
                  {docName.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-xs font-bold text-white truncate flex items-center gap-1">
                    {docName} <CheckCircle2 className="w-3 h-3 text-blue-400 shrink-0" />
                  </h4>
                  <p className="text-[10px] text-blue-400 truncate">{docSpec}</p>
                  <div className="flex items-center gap-1 text-[9px] text-amber-400 font-bold mt-0.5">
                    <Star className="w-3 h-3 fill-amber-400" /> {(doc as any).rating || '4.9'}
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Video className="w-3 h-3" /> Telehealth Ready
                </span>
                <span className="font-bold text-slate-200">KES {(doc as any).consultation_fee || 3500}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
  const docName = getDoctorName(doctor);
  const docSpec = getDoctorSpecialty(doctor);
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
          {docName.split(' ').map((n: string) => n[0]).join('')}
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
              {docName}
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            </h3>
            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-800/40">
              <Star className="w-3 h-3 fill-amber-400" /> {(doctor as any).rating || '4.9'}
            </span>
          </div>
          <p className="text-xs font-semibold text-blue-400">{docSpec}</p>
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
          <span className="font-black text-white text-sm">KES {(doctor as any).consultation_fee || 3500}</span>
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

export default function BookAppointmentPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [patientName, setPatientName] = useState<string>('Patient');
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

  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const today = formatDateToYYYYMMDD(new Date());
    setTodayStr(today);
    setSelectedDate(today);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function checkAuthAndFetchDoctors() {
      const { data: sessionData } = await supabase.auth.getSession();
      const { data: userData } = await supabase.auth.getUser();

      if (!isMounted) return;

      const activeUser = userData?.user || sessionData?.session?.user;

      if (activeUser) {
        setIsAuthenticated(true);
        setErrorMessage(null);

        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, name')
          .eq('id', activeUser.id)
          .single();

        if (profile?.full_name) {
          setPatientName(profile.full_name);
        } else if (profile?.name) {
          setPatientName(profile.name);
        } else if (activeUser.email) {
          const prefix = activeUser.email.split('@')[0];
          setPatientName(prefix.charAt(0).toUpperCase() + prefix.slice(1));
        }
      } else {
        setIsAuthenticated(false);
        setErrorMessage('Please login to proceed with booking an appointment.');
      }

      setIsAuthLoading(false);

      setIsLoadingDoctors(true);
      const { data: doctorData, error: doctorErr } = await supabase.from('doctors').select('*');
      if (!doctorErr && doctorData && doctorData.length > 0) {
        setDoctors(doctorData as Doctor[]);
        setSelectedDoctor(doctorData[0] as Doctor);
      } else {
        setDoctors([]);
      }
      setIsLoadingDoctors(false);
    }

    checkAuthAndFetchDoctors();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        setErrorMessage(null);
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setErrorMessage('Please login to proceed with booking an appointment.');
      }
      setIsAuthLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [pathname]);

  useEffect(() => {
    if (!selectedDoctor || !todayStr) return;
    const doctorId = selectedDoctor.id;

    async function loadDoctorSchedule() {
      const { data: rawAvail, error: availErr } = await supabase
        .from('doctor_availability')
        .select('*')
        .eq('doctor_id', doctorId);

      const { data: rawAppts } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', doctorId);

      if (availErr) {
        console.error('Supabase fetch error for doctor_availability:', availErr);
      }

      if (rawAvail) {
        const map: Record<string, DoctorAvailability> = {};
        rawAvail.forEach((item: any) => {
          const cleanDate = normalizeDateString(item.date || item.available_date || item.day);
          if (cleanDate) {
            map[cleanDate] = item;
          }
        });
        setAvailabilities(map);
      }

      if (rawAppts) {
        setAppointments(rawAppts as Appointment[]);
      }
    }

    loadDoctorSchedule();
  }, [selectedDoctor, todayStr]);

  const filteredDoctors = doctors.filter((doc) => {
    const docName = getDoctorName(doc);
    const docSpec = getDoctorSpecialty(doc);
    const matchesSearch =
      docName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      docSpec.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpec = specialtyFilter === 'All' || docSpec.toLowerCase() === specialtyFilter.toLowerCase();
    return matchesSearch && matchesSpec;
  });

  const activeAvailability: DoctorAvailability = availabilities[selectedDate] || {
    id: 'default-avail',
    doctor_id: selectedDoctor?.id || '',
    date: selectedDate,
    start_time: '08:00:00',
    end_time: '17:00:00',
    slot_duration: 30,
    slot_duration_minutes: 30,
    max_patients: 10,
    booked_patients: 0,
    clinic_location: 'Swift MD Central',
  };

  const dayAppointments = appointments.filter((a) => normalizeDateString((a as any).appointment_date) === selectedDate);
  const timeSlots = generateAvailableSlots(activeAvailability, dayAppointments);

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

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      setIsSubmitting(false);
      setErrorMessage('Authentication session not detected. Please ensure you are logged in.');
      return;
    }

    const currentUserId = user.id;
    const refCode = `SMD-${Math.floor(100000 + Math.random() * 900000)}`;

    const res = await createPatientBookingAction({
      doctorId: selectedDoctor.id,
      patientId: currentUserId,
      patientName: patientName,
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
      router.push('/patient/dashboard/consultations');
    } else {
      setErrorMessage(res.error || 'Failed to reserve appointment slot.');
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#050914] flex flex-col items-center justify-center text-slate-300 p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
        <p className="text-xs font-semibold tracking-wider uppercase text-slate-400">
          Verifying Session & Syncing Doctors...
        </p>
      </div>
    );
  }

  const remainingSlots = Math.max(
    0,
    (activeAvailability.max_patients ?? 10) - (activeAvailability.booked_patients ?? 0)
  );

  return (
    <div className="min-h-screen bg-[#050914] text-slate-100 font-sans p-4 md:p-8 space-y-6 pb-24 selection:bg-blue-600 selection:text-white rounded-3xl">
      <BookingHero patientName={patientName} step={step} />

      {!isAuthenticated && errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs font-semibold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => router.push('/login')}
            className="px-3 py-1.5 bg-rose-800 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition"
          >
            Sign In
          </button>
        </div>
      )}

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

          {isLoadingDoctors ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-5 rounded-3xl bg-[#0d1424] border border-slate-800 animate-pulse h-36" />
              ))}
            </div>
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
                  const dStr = formatDateToYYYYMMDD(dateObj);
                  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                  const formattedStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  const hasSchedule = !!availabilities[dStr];

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
                      <div className="flex items-center gap-2">
                        <span>{dayName}, {formattedStr}</span>
                        {hasSchedule && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Custom Schedule Set" />
                        )}
                      </div>
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
                  No available appointment slots on this date ({selectedDate}).
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
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {slot.startTime} - {slot.endTime}
                      </div>
                      <p className="text-[10px] opacity-70">
                        Remaining: {remainingSlots} slots
                      </p>
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
                  Additional Notes / Reason for Visit
                </label>
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1 transition ${
                    isListening
                      ? 'bg-rose-950 text-rose-400 border-rose-800 animate-pulse'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
                  }`}
                >
                  <Mic className="w-3 h-3" />
                  {isListening ? 'Listening...' : 'Dictate'}
                </button>
              </div>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe what you are experiencing..."
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-blue-500 transition resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-800 transition flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                disabled={isSubmitting}
                onClick={handleFinalBooking}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-bold text-xs shadow-lg transition flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Confirming...
                  </>
                ) : (
                  <>
                    Confirm & Reserve <Check className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="md:col-span-5 bg-[#0d1424] border border-slate-800 rounded-3xl p-6 space-y-4 h-fit">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800/80 pb-3">
              Appointment Summary
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Doctor</span>
                <span className="font-bold text-white">{getDoctorName(selectedDoctor)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Specialty</span>
                <span className="font-bold text-blue-400">{getDoctorSpecialty(selectedDoctor)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Format</span>
                <span className="font-bold text-white">{consultationType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date</span>
                <span className="font-bold text-white">{selectedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Time Slot</span>
                <span className="font-bold text-white">
                  {selectedSlot.startTime} - {selectedSlot.endTime}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t border-slate-800/80">
                <span className="text-slate-400 font-bold">Total Fee</span>
                <span className="font-black text-emerald-400 text-sm">
                  KES {(selectedDoctor as any).consultation_fee || 3500}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}