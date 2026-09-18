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
  Activity, Heart, Brain, Baby, Stethoscope
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
  const [consultationType, setConsultationType] = useState<'Telehealth' | 'Physical'>('Physical');

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

  useEffect(() => {
    async function fetchDoctors() {
      setIsLoading(true);
      const { data, error } = await supabase.from('doctors').select('*').order('rating', { ascending: false });
      if (!error && data && data.length > 0) {
        setDoctors(data as Doctor[]);
        setSelectedDoctor(data[0] as Doctor);
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
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'doctor_availability', filter: `doctor_id=eq.${doctorId}` },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const row = payload.new as DoctorAvailability;
            if (row?.date) {
              setAvailabilities((prev) => ({ ...prev, [row.date]: row }));
            }
          } else if (payload.eventType === 'DELETE') {
            const old = payload.old as { date?: string };
            if (old?.date) {
              const dateKey = old.date;
              setAvailabilities((prev) => {
                const copy = { ...prev };
                delete copy[dateKey];
                return copy;
              });
            }
          }
        }
      )
      .subscribe();

    const apptChan = supabase
      .channel(`appts-${doctorId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments', filter: `doctor_id=eq.${doctorId}` },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const appt = payload.new as Appointment;
            setAppointments((prev) => {
              const index = prev.findIndex((a) => a.id === appt.id);
              if (index !== -1) {
                const copy = [...prev];
                copy[index] = appt;
                return copy;
              }
              return [...prev, appt];
            });
          } else if (payload.eventType === 'DELETE') {
            const old = payload.old as { id?: string };
            if (old?.id) {
              setAppointments((prev) => prev.filter((a) => a.id !== old.id));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(availChan);
      supabase.removeChannel(apptChan);
    };
  }, [selectedDoctor, todayStr]);

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch = doc.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || doc.specialty.toLowerCase().includes(searchQuery.toLowerCase());
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
      alert('Voice dictation is supported in Chrome or Edge.');
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
      <div className="bg-gradient-to-r from-blue-950/80 via-[#0a1228] to-[#080d1a] border border-blue-800/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-full bg-blue-900/50 border border-blue-600/40 text-[10px] font-bold text-blue-300 uppercase tracking-widest flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-blue-400" /> 256-Bit Encrypted
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-950/40 border border-emerald-800/40 text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                <Activity className="w-3 h-3" /> Realtime Sync
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Book an Appointment</h1>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800/80">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${
                  step === s ? 'bg-blue-600 text-white shadow-lg' : step > s ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-900 text-slate-600'
                }`}>
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          {errorMessage}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search doctor name or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#0d1424] border border-slate-800 rounded-2xl text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDoctors.map((doc) => {
              const isSelected = selectedDoctor?.id === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoctor(doc)}
                  className={`p-5 rounded-3xl border transition cursor-pointer ${
                    isSelected ? 'bg-gradient-to-b from-[#0d1a38] to-[#0a1226] border-blue-500' : 'bg-[#0d1424] border-slate-800/80'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-950 border border-blue-500/30 flex items-center justify-center font-bold text-blue-300 text-lg">
                      {doc.full_name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-sm">{doc.full_name}</h3>
                      <p className="text-xs font-semibold text-blue-400">{doc.specialty}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="font-black text-white">KES {doc.consultation_fee}</span>
                    <button onClick={() => { setSelectedDoctor(doc); setStep(2); }} className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs">
                      Select Doctor <ChevronRight className="w-3.5 h-3.5 inline" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {step === 2 && selectedDoctor && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-5 bg-[#0d1424] border border-slate-800 rounded-3xl p-5 space-y-4">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-blue-400" /> Availability
            </h2>
            <div className="space-y-2 max-h-[420px] overflow-y-auto">
              {Array.from({ length: 14 }).map((_, i) => {
                const dateObj = new Date();
                dateObj.setDate(dateObj.getDate() + i);
                const dStr = dateObj.toISOString().split('T')[0];
                return (
                  <button
                    key={dStr}
                    onClick={() => { setSelectedDate(dStr); setSelectedSlot(null); }}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between text-xs font-bold ${
                      selectedDate === dStr ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-900 border-slate-800 text-slate-200'
                    }`}
                  >
                    <span>{dStr}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="md:col-span-7 bg-[#0d1424] border border-slate-800 rounded-3xl p-5 space-y-5">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" /> Available Time Slots
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot.startTime}
                  disabled={slot.isBooked}
                  onClick={() => setSelectedSlot(slot)}
                  className={`p-2.5 rounded-xl border text-xs font-bold ${
                    slot.isBooked ? 'bg-slate-950 text-slate-600 line-through' : selectedSlot?.startTime === slot.startTime ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-300'
                  }`}
                >
                  {slot.startTime}
                </button>
              ))}
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-800">
              <button onClick={() => setStep(1)} className="px-4 py-2.5 rounded-xl bg-slate-900 text-slate-300 text-xs font-bold">Back</button>
              <button disabled={!selectedSlot} onClick={() => setStep(3)} className="px-6 py-2.5 rounded-xl bg-blue-600 disabled:bg-slate-800 text-white font-bold text-xs">
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 3 && selectedDoctor && selectedSlot && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 space-y-5 bg-[#0d1424] border border-slate-800 rounded-3xl p-6">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Clinical Intake</h2>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for visit..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white"
            />
          </div>

          <div className="md:col-span-5 bg-[#0d1424] border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Booking Summary</h3>
            <p className="text-xs text-slate-300">{selectedDoctor.full_name} - {selectedDate} @ {selectedSlot.startTime}</p>
            <button
              onClick={handleFinalBooking}
              disabled={isSubmitting}
              className="w-full py-3.5 bg-emerald-600 text-slate-950 font-black text-xs rounded-2xl"
            >
              {isSubmitting ? 'Syncing...' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}