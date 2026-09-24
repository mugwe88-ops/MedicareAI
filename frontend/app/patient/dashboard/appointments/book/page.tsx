'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  MapPin, 
  User, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Mic, 
  RefreshCw,
  Search,
  Filter,
  Star,
  Building2
} from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  rating: number;
  reviews_count: number;
  consultation_fee: number;
  avatar?: string;
  bio?: string;
}

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export default function AppointmentBookingFlow() {
  const [step, setStep] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All');
  
  // Form state
  const [doctors, setDoctors] = useState<Doctor[]>([
    {
      id: 'doc-1',
      name: 'Dr. Sarah Mutua',
      specialty: 'Cardiologist',
      hospital: 'Nairobi Hospital',
      rating: 4.9,
      reviews_count: 124,
      consultation_fee: 4000,
      bio: 'Consultant Physician and Cardiologist with over 12 years of clinical experience.'
    },
    {
      id: 'doc-2',
      name: 'Dr. James Ochieng',
      specialty: 'Dermatologist',
      hospital: 'Aga Khan University Hospital',
      rating: 4.8,
      reviews_count: 98,
      consultation_fee: 3500,
      bio: 'Specialized in advanced dermatological care, medical aesthetics, and skin pathology.'
    },
    {
      id: 'doc-3',
      name: 'Dr. Amina Mohamed',
      specialty: 'Pediatrician',
      hospital: 'MP Shah Hospital',
      rating: 5.0,
      reviews_count: 156,
      consultation_fee: 3500,
      bio: 'Dedicated pediatrician focused on neonatology, child nutrition, and developmental health.'
    },
    {
      id: 'doc-4',
      name: 'Dr. David Kamau',
      specialty: 'General Practitioner',
      hospital: 'Karen Hospital',
      rating: 4.7,
      reviews_count: 82,
      consultation_fee: 2500,
      bio: 'Family physician with extensive background in acute care and chronic disease management.'
    }
  ]);

  const [selectedDoctor, setSelectedDoctor] = useState<Doctor>(doctors[0]);
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-02');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot>({ id: 'slot-2', startTime: '10:00 AM', endTime: '10:30 AM', isAvailable: true });
  const [consultationType, setConsultationType] = useState<string>('Video Call');
  const [patientName, setPatientName] = useState<string>('William Weru');
  const [patientEmail, setPatientEmail] = useState<string>('mugwe88@gmail.com');
  const [reason, setReason] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [bookingComplete, setBookingComplete] = useState<boolean>(false);

  const availableSlots: TimeSlot[] = [
    { id: 'slot-1', startTime: '09:00 AM', endTime: '09:30 AM', isAvailable: true },
    { id: 'slot-2', startTime: '10:00 AM', endTime: '10:30 AM', isAvailable: true },
    { id: 'slot-3', startTime: '11:00 AM', endTime: '11:30 AM', isAvailable: false },
    { id: 'slot-4', startTime: '02:00 PM', endTime: '02:30 PM', isAvailable: true },
    { id: 'slot-5', startTime: '03:00 PM', endTime: '03:30 PM', isAvailable: true },
    { id: 'slot-6', startTime: '04:00 PM', endTime: '04:30 PM', isAvailable: true },
  ];

  const specialties = ['All', 'Cardiologist', 'Dermatologist', 'Pediatrician', 'General Practitioner'];

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.hospital.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'All' || doc.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const getDoctorName = (doc: any) => doc?.name || 'Dr. Specialist';
  const getDoctorSpecialty = (doc: any) => doc?.specialty || 'General Practice';

  const handleVoiceDictation = () => {
    setIsListening(!isListening);
    // Simulated voice input toggling
    if (!isListening) {
      setTimeout(() => {
        setReason((prev) => (prev ? prev + ' Persistent headaches and fatigue over the last 3 days.' : 'Persistent headaches and fatigue over the last 3 days.'));
        setIsListening(false);
      }, 2000);
    }
  };

  const handleFinalBooking = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setBookingComplete(true);
    }, 1500);
  };

  if (bookingComplete) {
    return (
      <div className="max-w-2xl mx-auto mt-12 bg-[#0d1424] border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 bg-emerald-950 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-white">Appointment Confirmed!</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Your appointment has been successfully scheduled. A confirmation email has been dispatched to <span className="text-blue-400">{patientEmail}</span>.
          </p>
        </div>

        <div className="p-5 bg-[#050914] border border-slate-800 rounded-2xl text-left space-y-3 max-w-md mx-auto text-xs">
          <div className="flex justify-between pb-2 border-b border-slate-800">
            <span className="text-slate-500">Doctor</span>
            <span className="font-bold text-white">{getDoctorName(selectedDoctor)}</span>
          </div>
          <div className="flex justify-between pb-2 border-b border-slate-800">
            <span className="text-slate-500">Specialty</span>
            <span className="font-bold text-blue-400">{getDoctorSpecialty(selectedDoctor)}</span>
          </div>
          <div className="flex justify-between pb-2 border-b border-slate-800">
            <span className="text-slate-500">Date & Time</span>
            <span className="font-bold text-white">{selectedDate} ({selectedSlot.startTime})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Format</span>
            <span className="font-bold text-emerald-400">{consultationType}</span>
          </div>
        </div>

        <button
          onClick={() => {
            setBookingComplete(false);
            setStep(1);
          }}
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shadow-blue-950/50"
        >
          Book Another Appointment
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 bg-[#090d16] text-slate-100 min-h-screen font-sans">
      {/* Header & Step Indicator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-500" /> Swift MD Consultation Portal
          </h1>
          <p className="text-xs text-slate-400">Schedule certified specialist care online securely.</p>
        </div>

        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition ${
                  step === s
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/50'
                    : step > s
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-900 text-slate-500 border border-slate-800'
                }`}
              >
                {step > s ? <CheckCircle2 className="w-3.5 h-3.5" /> : s}
              </div>
              {s < 3 && <div className={`w-6 h-0.5 ${step > s ? 'bg-emerald-500/40' : 'bg-slate-800'}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: Doctor Selection & Search */}
      {step === 1 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search doctors by name, specialty, or hospital..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#0d1424] border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1" />
              {specialties.map((spec) => (
                <button
                  key={spec}
                  onClick={() => setSelectedSpecialty(spec)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                    selectedSpecialty === spec
                      ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                      : 'bg-[#0d1424] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDoctors.map((doc) => {
              const isSelected = selectedDoctor.id === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoctor(doc)}
                  className={`p-5 rounded-3xl border transition cursor-pointer flex flex-col justify-between gap-4 ${
                    isSelected
                      ? 'bg-[#0d1424] border-blue-500 shadow-xl shadow-blue-950/30'
                      : 'bg-[#090d16] border-slate-800/80 hover:border-slate-700 hover:bg-[#0d1424]/50'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-950 to-slate-900 border border-blue-500/30 flex items-center justify-center font-bold text-blue-300 text-sm shrink-0">
                      {doc.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div className="space-y-1 overflow-hidden flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-white truncate">{doc.name}</h3>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-lg flex items-center gap-1">
                          <Star className="w-3 h-3 fill-emerald-400" /> {doc.rating}
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-blue-400">{doc.specialty}</p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 truncate">
                        <Building2 className="w-3 h-3 text-slate-500 shrink-0" /> {doc.hospital}
                      </p>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{doc.bio}</p>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Consultation Fee</span>
                    <span className="font-black text-white">KES {doc.consultation_fee}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-950/50 transition flex items-center gap-1.5"
            >
              Continue to Schedule <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Date, Time & Format Selection */}
      {step === 2 && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fadeIn">
          <div className="md:col-span-7 space-y-6">
            <div className="bg-[#0d1424] border border-slate-800 rounded-3xl p-5 space-y-4">
              <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-blue-400" /> Select Consultation Date
              </h2>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-3 bg-[#050914] border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div className="bg-[#0d1424] border border-slate-800 rounded-3xl p-5 space-y-4">
              <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" /> Available Time Slots
              </h2>
              <div className="grid grid-cols-3 gap-2.5">
                {availableSlots.map((slot) => {
                  const isSelected = selectedSlot.id === slot.id;
                  return (
                    <button
                      key={slot.id}
                      disabled={!slot.isAvailable}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-3 rounded-2xl text-xs font-bold border transition flex flex-col items-center justify-center gap-1 ${
                        !slot.isAvailable
                          ? 'bg-slate-900/40 border-slate-800/50 text-slate-600 cursor-not-allowed line-through'
                          : isSelected
                          ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-md shadow-blue-950/50'
                          : 'bg-[#050914] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <span>{slot.startTime}</span>
                      <span className="text-[9px] font-normal text-slate-500">30 mins</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-[#0d1424] border border-slate-800 rounded-3xl p-5 space-y-4">
              <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Video className="w-4 h-4 text-blue-400" /> Consultation Format
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {['Video Call', 'In-Person Visit'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setConsultationType(type)}
                    className={`p-3.5 rounded-2xl text-xs font-bold border transition flex items-center justify-center gap-2 ${
                      consultationType === type
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                        : 'bg-[#050914] border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {type === 'Video Call' ? <Video className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-5 bg-[#0d1424] border border-slate-800 rounded-3xl p-6 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" /> Selected Specialist
              </h2>

              <div className="p-4 rounded-2xl bg-[#050914] border border-slate-800/80 space-y-3">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-800/80">
                  <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-500/30 flex items-center justify-center font-bold text-blue-300 text-xs shrink-0">
                    {getDoctorName(selectedDoctor)
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-xs font-bold text-white truncate flex items-center gap-1">
                      {getDoctorName(selectedDoctor)}
                      <CheckCircle2 className="w-3 h-3 text-blue-400 shrink-0" />
                    </h4>
                    <p className="text-[10px] text-blue-400 truncate">{getDoctorSpecialty(selectedDoctor)}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" /> Facility
                    </span>
                    <span className="font-bold text-white text-[11px] truncate max-w-[150px]">
                      {selectedDoctor.hospital}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="flex items-center gap-1 text-[11px]">
                      <CalendarIcon className="w-3.5 h-3.5 text-slate-500" /> Date
                    </span>
                    <span className="font-bold text-white text-[11px]">{selectedDate}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-slate-500" /> Time
                    </span>
                    <span className="font-bold text-white text-[11px]">{selectedSlot.startTime}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-800 transition flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-950/50 transition flex items-center gap-1.5"
              >
                Proceed to Review <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Patient Info & Final Confirmation */}
      {step === 3 && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fadeIn">
          <div className="md:col-span-7 bg-[#0d1424] border border-slate-800 rounded-3xl p-6 space-y-5">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-blue-400" /> Patient Details & Medical Notes
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400">Full Name</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full p-3 bg-[#050914] border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400">Email Address</label>
                <input
                  type="email"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  className="w-full p-3 bg-[#050914] border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-slate-400">Reason for Visit / Symptoms</label>
                <button
                  type="button"
                  onClick={handleVoiceDictation}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1 transition ${
                    isListening
                      ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <Mic className="w-3 h-3 text-blue-400" />
                  {isListening ? 'Listening...' : 'Voice Dictation'}
                </button>
              </div>
              <textarea
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe your symptoms, medical history related to this visit, or any questions for the doctor..."
                className="w-full p-3.5 bg-[#050914] border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-800 transition flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalBooking}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 transition flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Confirming...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Confirm Appointment
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="md:col-span-5 bg-[#0d1424] border border-slate-800 rounded-3xl p-6 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" /> Booking Summary
              </h2>

              <div className="p-4 rounded-2xl bg-[#050914] border border-slate-800/80 space-y-3">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-800/80">
                  <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-500/30 flex items-center justify-center font-bold text-blue-300 text-xs shrink-0">
                    {getDoctorName(selectedDoctor)
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-xs font-bold text-white truncate flex items-center gap-1">
                      {getDoctorName(selectedDoctor)}
                      <CheckCircle2 className="w-3 h-3 text-blue-400 shrink-0" />
                    </h4>
                    <p className="text-[10px] text-blue-400 truncate">{getDoctorSpecialty(selectedDoctor)}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="flex items-center gap-1 text-[11px]">
                      <CalendarIcon className="w-3.5 h-3.5 text-slate-500" /> Date
                    </span>
                    <span className="font-bold text-white text-[11px]">{selectedDate}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-slate-500" /> Time
                    </span>
                    <span className="font-bold text-white text-[11px]">
                      {selectedSlot.startTime} - {selectedSlot.endTime}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Video className="w-3.5 h-3.5 text-slate-500" /> Format
                    </span>
                    <span className="font-bold text-blue-400 text-[11px]">{consultationType}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="flex items-center gap-1 text-[11px]">
                      <User className="w-3.5 h-3.5 text-slate-500" /> Patient
                    </span>
                    <span className="font-bold text-white text-[11px]">{patientName}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-900/40 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Consultation Fee</span>
                  <span className="text-slate-200 font-bold">
                    KES {(selectedDoctor as any).consultation_fee || 3500}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Platform Processing</span>
                  <span className="text-emerald-400 font-bold">Free</span>
                </div>
                <div className="pt-2 border-t border-blue-900/40 flex justify-between items-center">
                  <span className="text-xs font-bold text-white">Total Amount</span>
                  <span className="text-sm font-black text-blue-400">
                    KES {(selectedDoctor as any).consultation_fee || 3500}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 text-center leading-relaxed">
              By confirming, you agree to Swift MD&apos;s Terms of Medical Service and Privacy Policy. Cancellation is permitted up to 2 hours before appointment time.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}