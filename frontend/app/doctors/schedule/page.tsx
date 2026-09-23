'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useOptimistic, useTransition } from 'react';
import { supabase, DoctorAvailability, Appointment, AvailabilityStatus } from '@/lib/supabase';
import { 
  ChevronLeft, ChevronRight, Clock, Users, MapPin, Check, Copy, 
  Sparkles, Loader2, Calendar as CalendarIcon, AlertTriangle, UserCheck, X, Save
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

  const [optimisticSchedule, setOptimisticSchedule] = useOptimistic(
    dbSchedule,
    (current, updatedItem: DoctorAvailability) => ({
      ...current,
      [updatedItem.date]: updatedItem,
    })
  );

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

    const availChannel = supabase
      .channel('realtime-doctor-availability')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'doctor_availability' }, (payload) => {
        const updated = payload.new as DoctorAvailability;
        if (updated && updated.date) {
          setDbSchedule(prev => ({ ...prev, [updated.date]: updated }));
        }
      })
      .subscribe();

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

  const updateField = (field: keyof DoctorAvailability, value: any) => {
    setFormState(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const dayAppointments = appointments.filter(a => a.appointment_date === selectedDay);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans p-4 md:p-6">
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl border text-xs font-bold flex items-center gap-2 animate-bounce ${
          toastMessage.type === 'error' ? 'bg-rose-950 border-rose-800 text-rose-200' : 'bg-emerald-950 border-emerald-800 text-emerald-200'
        }`}>
          {toastMessage.type === 'error' ? <AlertTriangle className="w-4 h-4 text-rose-400" /> : <Check className="w-4 h-4 text-emerald-400" />}
          {toastMessage.text}
        </div>
      )}

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

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={handleCopyLastWeek} className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 font-semibold flex items-center gap-1.5 transition">
            <Copy className="w-3.5 h-3.5" /> Copy Last Week
          </button>
          <button onClick={handleAIOptimize} className="px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800/50 text-xs text-purple-300 font-semibold flex items-center gap-1.5 transition">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> AI Optimize
          </button>
          <button onClick={handleSave} disabled={isSaving} className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-xs text-white font-bold flex items-center gap-1.5 transition shadow-lg">
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save Shift
          </button>
        </div>
      </header>

      {hasUnsavedChanges && (
        <div className="mt-4 p-3 rounded-2xl bg-amber-950/50 border border-amber-800/60 text-amber-300 text-xs font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> You have unsaved changes for {selectedDay}.</span>
          <button onClick={handleSave} className="px-3 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs">Save Now</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
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
                      <span className={`text-xs font-bold ${isToday ? 'text-blue-400 underline' : 'text-slate-300'}`}>
                        {dayNum}
                      </span>
                      <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                    </div>
                    <div>
                      <p className={`text-[10px] font-bold truncate ${style.text}`}>{statusKey}</p>
                      <p className="text-[9px] text-slate-500 mt-0.5">
                        {item ? `${item.start_time || '08:00'}-${item.end_time || '17:00'}` : '08:00-17:00'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="bg-[#0e1422] p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400" /> Confirmed Patient Appointments ({selectedDay})
            </h3>
            {dayAppointments.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No appointments scheduled for this date yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {dayAppointments.map(appt => (
                  <div key={appt.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{appt.patient_name || 'Patient'}</span>
                      <span className="text-[10px] text-blue-400 font-mono">{appt.start_time} - {appt.end_time}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">Reason: {appt.reason || 'General Consultation'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 bg-[#0e1422] p-5 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" /> Shift Details ({selectedDay})
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 text-[11px] font-bold mb-1">Status</label>
              <select
                value={formState.status || 'Available'}
                onChange={(e) => updateField('status', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="Available">Available</option>
                <option value="Few slots left">Few slots left</option>
                <option value="Nearly Full">Nearly Full</option>
                <option value="Fully Booked">Fully Booked</option>
                <option value="Off Duty">Off Duty</option>
                <option value="Leave">Leave</option>
                <option value="Holiday">Holiday</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] font-bold mb-1">Clinic / Telehealth Location</label>
              <input
                type="text"
                value={formState.clinic_location || ''}
                onChange={(e) => updateField('clinic_location', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 text-[11px] font-bold mb-1">Start Time</label>
                <input
                  type="time"
                  value={formState.start_time || '08:00'}
                  onChange={(e) => updateField('start_time', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[11px] font-bold mb-1">End Time</label>
                <input
                  type="time"
                  value={formState.end_time || '17:00'}
                  onChange={(e) => updateField('end_time', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 text-[11px] font-bold mb-1">Slot Duration (Mins)</label>
                <input
                  type="number"
                  value={formState.slot_duration || 30}
                  onChange={(e) => updateField('slot_duration', parseInt(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[11px] font-bold mb-1">Max Patients</label>
                <input
                  type="number"
                  value={formState.max_patients || 10}
                  onChange={(e) => updateField('max_patients', parseInt(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] font-bold mb-1">Shift Notes / Announcements</label>
              <textarea
                rows={3}
                value={formState.notes || ''}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="E.g., Telehealth consultations preferred during morning hours..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}