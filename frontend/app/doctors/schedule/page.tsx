'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useOptimistic, useTransition } from 'react';
import { supabase, DoctorAvailability, Appointment, AvailabilityStatus } from '@/lib/supabase';
import { 
  ChevronLeft, ChevronRight, Clock, Users, MapPin, Check, Copy, 
  Sparkles, Loader2, Calendar as CalendarIcon, AlertTriangle, UserCheck, X
} from 'lucide-react';

const DEMO_DOCTOR_ID = "11111111-1111-1111-1111-111111111111";

const statusColorMap: Record<AvailabilityStatus, { bg: string; border: string; text: string; dot: string }> = {
  'Available': { bg: 'bg-emerald-950/40 hover:bg-emerald-900/50', border: 'border-emerald-800/60', text: 'text-emerald-400', dot: 'bg-emerald-500' },
  'Few slots left': { bg: 'bg-teal-950/40 hover:bg-teal-900/50', border: 'border-teal-800/60', text: 'text-teal-400', dot: 'bg-teal-500' },
  'Nearly Full': { bg: 'bg-amber-950/40 hover:bg-amber-900/50', border: 'border-amber-800/60', text: 'text-amber-400', dot: 'bg-amber-500' },
  'Fully Booked': { bg: 'bg-rose-950/40 hover:bg-rose-900/50', border: 'border-rose-800/60', text: 'text-rose-400', dot: 'bg-rose-500' },
  'Off Duty': { bg: 'bg-neutral-900/40 hover:bg-neutral-800/50', border: 'border-neutral-800/60', text: 'text-neutral-500', dot: 'bg-neutral-600' },
  'Leave': { bg: 'bg-purple-950/40 hover:bg-purple-900/50', border: 'border-purple-800/60', text: 'text-purple-400', dot: 'bg-purple-500' },
  'Holiday': { bg: 'bg-sky-950/40 hover:bg-sky-900/50', border: 'border-sky-800/60', text: 'text-sky-400', dot: 'bg-sky-500' },
};

export default function DoctorSchedulePage() {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDay, setSelectedDay] = useState<string>(todayStr);
  const [dbSchedule, setDbSchedule] = useState<Record<string, DoctorAvailability>>({});
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  // Selected Day Form Settings
  const [formState, setFormState] = useState<Partial<DoctorAvailability>>({
    status: 'Available',
    clinic_location: 'Main City Clinic - Room 302',
    start_time: '08:00',
    end_time: '17:00',
    morning_enabled: true,
    afternoon_enabled: true,
    buffer_minutes: 15,
    slot_duration: 30,
    max_patients: 10,
    booked_patients: 0,
    emergency_enabled: true,
    notes: ''
  });

  // Optimistic Calendar Map Update
  const [optimisticSchedule, setOptimisticSchedule] = useOptimistic(
    dbSchedule,
    (current, updatedItem: DoctorAvailability) => ({
      ...current,
      [updatedItem.date]: updatedItem,
    })
  );

  // Load Schedule & Appointments + Supabase Realtime Subscriptions
  useEffect(() => {
    async function loadInitialData() {
      setIsLoading(true);

      const [availRes, apptRes] = await Promise.all([
        supabase.from('doctor_availability').select('*').eq('doctor_id', DEMO_DOCTOR_ID),
        supabase.from('appointments').select('*').eq('doctor_id', DEMO_DOCTOR_ID)
      ]);

      if (availRes.data) {
        const map: Record<string, DoctorAvailability> = {};
        availRes.data.forEach((item: DoctorAvailability) => {
          map[item.date] = item;
        });
        setDbSchedule(map);
      }

      if (apptRes.data) {
        setAppointments(apptRes.data as Appointment[]);
      }

      setIsLoading(false);
    }

    loadInitialData();

    // Realtime listener for availability changes
    const availChannel = supabase
      .channel('realtime-doctor-availability')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'doctor_availability' }, (payload) => {
        const updated = payload.new as DoctorAvailability;
        if (updated && updated.date) {
          setDbSchedule(prev => ({ ...prev, [updated.date]: updated }));
        }
      })
      .subscribe();

    // Realtime listener for patient booking synchronization
    const apptChannel = supabase
      .channel('realtime-appointments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, (payload) => {
        const appt = payload.new as Appointment;
        if (appt) {
          setAppointments(prev => {
            const index = prev.findIndex(a => a.id === appt.id);
            if (index > -1) {
              const updatedList = [...prev];
              updatedList[index] = appt;
              return updatedList;
            }
            return [...prev, appt];
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(availChannel);
      supabase.removeChannel(apptChannel);
    };
  }, []);

  // Update Form when selected date changes
  useEffect(() => {
    const existing = dbSchedule[selectedDay];
    if (existing) {
      setFormState(existing);
    } else {
      setFormState({
        status: 'Available',
        clinic_location: 'Main City Clinic - Room 302',
        start_time: '08:00',
        end_time: '17:00',
        morning_enabled: true,
        afternoon_enabled: true,
        buffer_minutes: 15,
        slot_duration: 30,
        max_patients: 10,
        booked_patients: 0,
        emergency_enabled: true,
        notes: ''
      });
    }
    setHasUnsavedChanges(false);
  }, [selectedDay, dbSchedule]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Save changes to Supabase
  const handleSave = async () => {
    setIsSaving(true);

    const payload: DoctorAvailability = {
      doctor_id: DEMO_DOCTOR_ID,
      date: selectedDay,
      status: (formState.status as AvailabilityStatus) || 'Available',
      clinic_location: formState.clinic_location || 'Main City Clinic - Room 302',
      start_time: formState.start_time || '08:00',
      end_time: formState.end_time || '17:00',
      morning_enabled: formState.morning_enabled ?? true,
      afternoon_enabled: formState.afternoon_enabled ?? true,
      buffer_minutes: Number(formState.buffer_minutes) || 15,
      slot_duration: Number(formState.slot_duration) || 30,
      max_patients: Number(formState.max_patients) || 10,
      booked_patients: Number(formState.booked_patients) || 0,
      emergency_enabled: formState.emergency_enabled ?? true,
      notes: formState.notes || ''
    };

    // Apply Optimistic Update UI
    startTransition(() => {
      setOptimisticSchedule(payload);
    });

    const { data, error } = await supabase
      .from('doctor_availability')
      .upsert(payload, { onConflict: 'doctor_id,date' })
      .select();

    setIsSaving(false);

    if (error) {
      showToast(`Save failed: ${error.message}`, 'error');
    } else {
      showToast(`Schedule saved for ${selectedDay}!`, 'success');
      setHasUnsavedChanges(false);
      if (data && data[0]) {
        setDbSchedule(prev => ({ ...prev, [selectedDay]: data[0] as DoctorAvailability }));
      }
    }
  };

  // Bulk Action: Copy Last Week
  const handleCopyLastWeek = async () => {
    showToast('Applying previous week schedule pattern...', 'success');
    const current = new Date(selectedDay);
    current.setDate(current.getDate() - 7);
    const prevDateStr = current.toISOString().split('T')[0];
    const prevSchedule = dbSchedule[prevDateStr];

    if (prevSchedule) {
      setFormState({ ...prevSchedule, date: selectedDay });
      setHasUnsavedChanges(true);
    } else {
      showToast('No record found for previous week date.', 'error');
    }
  };

  // Bulk Action: AI Optimize Hours
  const handleAIOptimize = () => {
    setFormState(prev => ({
      ...prev,
      start_time: '08:30',
      end_time: '16:30',
      buffer_minutes: 15,
      max_patients: 12,
      notes: 'AI Optimized: Shifted peak hours to match patient demand trends.'
    }));
    setHasUnsavedChanges(true);
    showToast('AI Suggested optimal hours applied! Click save to commit.', 'success');
  };

  const dayAppointments = appointments.filter(a => a.appointment_date === selectedDay);
  const remainingSlots = Math.max(0, (formState.max_patients || 10) - (formState.booked_patients || dayAppointments.length));

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans p-4 md:p-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl border text-xs font-bold flex items-center gap-2 animate-bounce ${
          toastMessage.type === 'error' ? 'bg-rose-950 border-rose-800 text-rose-200' : 'bg-emerald-950 border-emerald-800 text-emerald-200'
        }`}>
          {toastMessage.type === 'error' ? <AlertTriangle className="w-4 h-4 text-rose-400" /> : <Check className="w-4 h-4 text-emerald-400" />}
          {toastMessage.text}
        </div>
      )}

      {/* Sticky Top Bar */}
      <header className="sticky top-0 z-30 bg-[#090d16]/90 backdrop-blur-md pb-4 border-b border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            Doctor Schedule & Availability 
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800/50">
              Supabase Live Sync
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage operating shifts, custom capacity, and view live bookings.</p>
        </div>

        {/* Quick Bulk Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={handleCopyLastWeek} className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 font-semibold flex items-center gap-1.5 transition">
            <Copy className="w-3.5 h-3.5" /> Copy Last Week
          </button>
          <button onClick={handleAIOptimize} className="px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800/50 text-xs text-purple-300 font-semibold flex items-center gap-1.5 transition">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> AI Optimize
          </button>
        </div>
      </header>

      {/* Unsaved Changes Banner */}
      {hasUnsavedChanges && (
        <div className="mt-4 p-3 rounded-2xl bg-amber-950/50 border border-amber-800/60 text-amber-300 text-xs font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> You have unsaved changes for {selectedDay}.</span>
          <button onClick={handleSave} className="px-3 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs">Save Now</button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        
        {/* Calendar View (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between bg-[#0e1422] p-4 rounded-2xl border border-slate-800">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-blue-400" /> September 2026
            </h2>
            <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Available</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Nearly Full</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Full</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-neutral-600"></span> Off</span>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 28 }).map((_, i) => (
                <div key={i} className="h-24 rounded-2xl bg-slate-900/50 animate-pulse border border-slate-800/40"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 30 }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = `2026-09-${dayNum.toString().padStart(2, '0')}`;
                const item = optimisticSchedule[dateStr];
                const statusKey = item?.status || 'Available';
                const style = statusColorMap[statusKey] || statusColorMap['Available'];
                const isSelected = selectedDay === dateStr;
                const isToday = dateStr === todayStr;

                return (
                  <div
                    key={dateStr}
                    onClick={() => setSelectedDay(dateStr)}
                    className={`min-h-[92px] rounded-2xl p-3 flex flex-col justify-between cursor-pointer border transition-all ${style.bg} ${style.border} ${
                      isSelected ? 'ring-2 ring-blue-500 border-blue-500 shadow-xl scale-[1.02] bg-blue-950/20' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-black ${isToday ? 'px-2 py-0.5 rounded-md bg-blue-600 text-white' : 'text-slate-200'}`}>
                        {dayNum}
                      </span>
                      <span className={`w-2 h-2 rounded-full ${style.dot}`}></span>
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-[10px] text-slate-400 font-medium">
                        {item ? `${item.start_time.slice(0,5)} - ${item.end_time.slice(0,5)}` : '08:00 - 17:00'}
                      </p>
                      <p className={`text-[10px] font-bold ${style.text}`}>{statusKey}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Booked Appointments Realtime Section */}
          <div className="bg-[#0e1422] border border-slate-800 rounded-3xl p-5 space-y-3 mt-6">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Booked Patients for {selectedDay}</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px]">
                {dayAppointments.length} Booked
              </span>
            </h3>

            {dayAppointments.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center italic">No patient bookings registered for this date.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {dayAppointments.map(appt => (
                  <div key={appt.id} className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-200">{appt.patient_name || 'Patient'}</p>
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-800/60">
                        {appt.status || 'Confirmed'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {appt.start_time} - {appt.end_time} ({appt.consultation_type || 'General'})
                      </p>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">
                      Reason: {(appt as any).reason || 'General Consultation'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Schedule & Availability Editor Panel (4 Cols) */}
        <div className="lg:col-span-4 bg-[#0e1422] border border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl sticky top-20">
          <div>
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Configure Availability</span>
            <h2 className="text-base font-black text-white mt-0.5">{selectedDay}</h2>
          </div>

          {/* Status Select */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400 font-semibold">Shift Status</label>
            <select
              value={formState.status || 'Available'}
              onChange={(e) => {
                setFormState(prev => ({ ...prev, status: e.target.value as AvailabilityStatus }));
                setHasUnsavedChanges(true);
              }}
              className="bg-slate-950 border border-slate-800 text-xs rounded-xl px-3 py-2 text-slate-200 w-full focus:outline-none focus:border-blue-500"
            >
              <option value="Available">Available (Green)</option>
              <option value="Few slots left">Few slots left (Teal)</option>
              <option value="Nearly Full">Nearly Full (Orange)</option>
              <option value="Fully Booked">Fully Booked (Red)</option>
              <option value="Off Duty">Off Duty (Grey)</option>
              <option value="Leave">Leave (Purple)</option>
              <option value="Holiday">Holiday (Blue)</option>
            </select>
          </div>

          {/* Clinic Location */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400 font-semibold">Clinic Location</label>
            <input
              type="text"
              value={formState.clinic_location || ''}
              onChange={(e) => {
                setFormState(prev => ({ ...prev, clinic_location: e.target.value }));
                setHasUnsavedChanges(true);
              }}
              className="bg-slate-950 border border-slate-800 text-xs rounded-xl px-3 py-2 text-slate-200 w-full focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Working Hours */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] text-slate-400 font-semibold">Start Time</label>
              <input
                type="time"
                value={formState.start_time || '08:00'}
                onChange={(e) => {
                  setFormState(prev => ({ ...prev, start_time: e.target.value }));
                  setHasUnsavedChanges(true);
                }}
                className="bg-slate-950 border border-slate-800 text-xs rounded-xl px-3 py-2 text-slate-200 w-full"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-slate-400 font-semibold">End Time</label>
              <input
                type="time"
                value={formState.end_time || '17:00'}
                onChange={(e) => {
                  setFormState(prev => ({ ...prev, end_time: e.target.value }));
                  setHasUnsavedChanges(true);
                }}
                className="bg-slate-950 border border-slate-800 text-xs rounded-xl px-3 py-2 text-slate-200 w-full"
              />
            </div>
          </div>

          {/* Capacity & Remaining Slots Calculation */}
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-400">Max Capacity:</span>
              <input
                type="number"
                min={1}
                max={50}
                value={formState.max_patients || 10}
                onChange={(e) => {
                  setFormState(prev => ({ ...prev, max_patients: Number(e.target.value) }));
                  setHasUnsavedChanges(true);
                }}
                className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-0.5 text-right text-xs text-white"
              />
            </div>
            <div className="flex items-center justify-between text-xs font-semibold pt-1 border-t border-slate-800/60">
              <span className="text-slate-400">Remaining Slots:</span>
              <span className={`font-bold ${remainingSlots > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {remainingSlots} slots left
              </span>
            </div>
          </div>

          {/* Buffer Time & Emergency Toggle */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl flex flex-col gap-1">
              <span className="text-[10px] text-slate-400 font-semibold">Buffer Time</span>
              <select
                value={formState.buffer_minutes || 15}
                onChange={(e) => {
                  setFormState(prev => ({ ...prev, buffer_minutes: Number(e.target.value) }));
                  setHasUnsavedChanges(true);
                }}
                className="bg-slate-900 text-xs rounded-lg px-2 py-1 border border-slate-800 text-slate-200"
              >
                <option value={5}>5 mins</option>
                <option value={10}>10 mins</option>
                <option value={15}>15 mins</option>
                <option value={30}>30 mins</option>
              </select>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-semibold">Emergency</span>
                <span className="text-[10px] text-slate-500">Override</span>
              </div>
              <input
                type="checkbox"
                checked={formState.emergency_enabled ?? true}
                onChange={(e) => {
                  setFormState(prev => ({ ...prev, emergency_enabled: e.target.checked }));
                  setHasUnsavedChanges(true);
                }}
                className="rounded border-slate-700 bg-slate-900 text-blue-600 w-4 h-4"
              />
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 mt-2"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {isSaving ? 'Persisting to Supabase...' : 'Save Schedule Changes'}
          </button>
        </div>

      </div>
    </div>
  );
}