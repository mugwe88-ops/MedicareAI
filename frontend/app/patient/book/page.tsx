'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { supabase, DoctorAvailability, Appointment } from '@/lib/supabase';
import { generateAvailableSlots, GeneratedTimeSlot } from '@/lib/slot-calculator';
import { createPatientBookingAction } from './actions';
import { 
  Calendar as CalendarIcon, Clock, MapPin, CheckCircle, AlertCircle, Loader2, Video, Building
} from 'lucide-react';

const DEMO_DOCTOR_ID = "11111111-1111-1111-1111-111111111111";
const DEMO_PATIENT_ID = "22222222-2222-2222-2222-222222222222";

export default function PatientBookingPage() {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [availabilities, setAvailabilities] = useState<Record<string, DoctorAvailability>>({});
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<GeneratedTimeSlot | null>(null);
  const [consultationType, setConsultationType] = useState<'Physical' | 'Telehealth'>('Physical');
  const [patientName, setPatientName] = useState<string>('Sarah Jenkins');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load Single Source of Truth Availability
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);

      const [availRes, apptRes] = await Promise.all([
        supabase.from('doctor_availability').select('*').eq('doctor_id', DEMO_DOCTOR_ID),
        supabase.from('appointments').select('*').eq('doctor_id', DEMO_DOCTOR_ID)
      ]);

      if (availRes.data) {
        const map: Record<string, DoctorAvailability> = {};
        availRes.data.forEach((item: DoctorAvailability) => { map[item.date] = item; });
        setAvailabilities(map);
      }

      if (apptRes.data) {
        setAppointments(apptRes.data as Appointment[]);
      }

      setIsLoading(false);
    }

    loadData();

    // Supabase Realtime Subscriptions for patient view sync
    const availSub = supabase
      .channel('patient-view-availability')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'doctor_availability' }, (payload) => {
        const updated = payload.new as DoctorAvailability;
        if (updated && updated.date) {
          setAvailabilities(prev => ({ ...prev, [updated.date]: updated }));
        }
      })
      .subscribe();

    const apptSub = supabase
      .channel('patient-view-appointments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, (payload) => {
        const appt = payload.new as Appointment;
        if (appt) {
          setAppointments(prev => {
            const idx = prev.findIndex(a => a.id === appt.id);
            if (idx > -1) {
              const list = [...prev];
              list[idx] = appt;
              return list;
            }
            return [...prev, appt];
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(availSub);
      supabase.removeChannel(apptSub);
    };
  }, []);

  const currentDayAvailability = availabilities[selectedDate] || null;
  const dayAppointments = appointments.filter(a => a.appointment_date === selectedDate);
  const availableSlots = generateAvailableSlots(currentDayAvailability, dayAppointments);

  const handleBooking = async () => {
    if (!selectedSlot || !selectedDate) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await createPatientBookingAction({
      doctorId: DEMO_DOCTOR_ID,
      patientId: DEMO_PATIENT_ID,
      patientName,
      appointmentDate: selectedDate,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      consultationType
    });

    setIsSubmitting(false);

    if (res.success) {
      setBookingSuccess(true);
      setSelectedSlot(null);
    } else {
      setErrorMessage(res.error || 'Failed to complete booking.');
    }
  };

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-black text-white">Book Doctor Appointment</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time availability directly synchronized with Dr. Marcus Vance.
          </p>
        </div>

        {bookingSuccess && (
          <div className="p-6 rounded-3xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 space-y-2 text-center animate-fade-in">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
            <h2 className="text-lg font-bold text-white">Appointment Confirmed!</h2>
            <p className="text-xs text-emerald-300">
              Your consultation is booked for <strong className="text-white">{selectedDate}</strong> at <strong className="text-white">{selectedSlot?.startTime}</strong>.
            </p>
            <button 
              onClick={() => setBookingSuccess(false)}
              className="mt-4 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl"
            >
              Book Another Session
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            {errorMessage}
          </div>
        )}

        {/* Main Selection Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Date & Location Picker (5 Cols) */}
          <div className="md:col-span-5 bg-[#0d1424] border border-slate-800/80 rounded-3xl p-5 space-y-4">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-blue-400" /> 1. Select Date
            </h2>

            <div className="space-y-2">
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
                    onClick={() => {
                      setSelectedDate(dStr);
                      setSelectedSlot(null);
                    }}
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

          {/* Time Slot Picker & Confirmation (7 Cols) */}
          <div className="md:col-span-7 bg-[#0d1424] border border-slate-800/80 rounded-3xl p-5 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" /> 2. Available Slots ({selectedDate})
              </h2>
              <span className="text-[10px] text-slate-400">
                {availableSlots.filter(s => !s.isBooked).length} remaining
              </span>
            </div>

            {/* Clinic / Telehealth Metadata */}
            {currentDayAvailability && (
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs space-y-1">
                <p className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" /> {currentDayAvailability.clinic_location}
                </p>
                <p className="text-[10px] text-slate-400">
                  Buffer: {currentDayAvailability.buffer_minutes}m | Consultation: {currentDayAvailability.slot_duration}m
                </p>
              </div>
            )}

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

            {/* Time Slot Grid */}
            {isLoading ? (
              <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
            ) : availableSlots.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 italic bg-slate-950/40 rounded-2xl border border-slate-900">
                No slots available for this date. Please choose another date.
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {availableSlots.map((slot) => (
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

            {/* Patient Name Input */}
            <div className="space-y-1 pt-2">
              <label className="text-[11px] font-semibold text-slate-400">Patient Full Name</label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleBooking}
              disabled={!selectedSlot || isSubmitting}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-black text-xs rounded-xl transition shadow-xl flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <CheckCircle className="w-4 h-4" />}
              {isSubmitting ? 'Reserving Slot with Supabase...' : selectedSlot ? `Confirm Booking for ${selectedSlot.startTime}` : 'Select a Slot to Continue'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}