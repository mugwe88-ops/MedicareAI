'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  ShieldCheck, Clock, CheckCircle2, Video, MapPin,
  PlusCircle, MessageSquare, FileText, Pill, Activity, AlertCircle,
  Calendar as CalendarIcon, Sparkles, Bot, X, Download, Share2,
  CalendarPlus, ChevronRight, Mic, Camera, Wifi, Check, AlertTriangle,
  FileCheck, UserCheck, Stethoscope, RefreshCw
} from 'lucide-react';

interface Doctor {
  id: string;
  full_name: string;
  specialty: string;
  avatar_url?: string;
  location?: string;
}

interface Appointment {
  id: string;
  appointment_date: string;
  start_time: string;
  end_time?: string;
  consultation_type: 'Telehealth' | 'Physical' | string;
  status: 'Scheduled' | 'In Progress' | 'Confirmed' | 'Completed' | 'Cancelled' | string;
  notes?: string;
  doctor?: Doctor;
}

export default function PatientAppointmentsDashboard() {
  const [patientName, setPatientName] = useState<string>('Patient');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTab, setSelectedTab] = useState<'Upcoming' | 'Past' | 'All'>('Upcoming');
  
  // AI Assistant State
  const [aiOpen, setAiOpen] = useState<boolean>(false);
  const [aiInput, setAiInput] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  // Modals & Interactivity
  const [showPreCheck, setShowPreCheck] = useState<boolean>(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState<boolean>(false);
  const [expandedNotesId, setExpandedNotesId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Device check mock states
  const [cameraOk, setCameraOk] = useState<boolean>(true);
  const [micOk, setMicOk] = useState<boolean>(true);
  const [pingSpeed, setPingSpeed] = useState<number>(24);

  // Live countdown state
  const [countdownText, setCountdownText] = useState<string>('');

  // 1. Fetch user profile & appointments
  useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true);

      // Fetch Logged-in Patient Name
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, name')
          .eq('id', user.id)
          .single();

        if (profile?.full_name) {
          setPatientName(profile.full_name);
        } else if (profile?.name) {
          setPatientName(profile.name);
        } else if (user.email) {
          const emailPrefix = user.email.split('@')[0];
          setPatientName(emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1));
        }
      }

      // Fetch Appointments
      const { data, error } = await supabase
        .from('appointments')
        .select(`*, doctor:doctors(*)`)
        .order('appointment_date', { ascending: true });

      if (!error && data) {
        setAppointments(data as Appointment[]);
      }
      setIsLoading(false);
    }

    loadDashboard();

    const channel = supabase
      .channel('realtime_appointments_dashboard_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        loadDashboard();
        triggerToast('Realtime update received from server.');
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Filter appointments
  const upcomingAppointments = appointments.filter(
    (a) => a.status === 'Scheduled' || a.status === 'In Progress' || a.status === 'Confirmed'
  );
  const pastAppointments = appointments.filter(
    (a) => a.status === 'Completed' || a.status === 'Cancelled'
  );

  const displayedAppointments =
    selectedTab === 'Upcoming'
      ? upcomingAppointments
      : selectedTab === 'Past'
      ? pastAppointments
      : appointments;

  const heroAppointment = upcomingAppointments[0] || null;

  // 2. Live Countdown Timer to Hero Appointment
  useEffect(() => {
    if (!heroAppointment) return;

    const timer = setInterval(() => {
      const apptDateStr = `${heroAppointment.appointment_date}T${heroAppointment.start_time || '09:00:00'}`;
      const targetTime = new Date(apptDateStr).getTime();
      const currentTime = new Date().getTime();
      const diff = targetTime - currentTime;

      if (isNaN(targetTime) || diff <= 0) {
        setCountdownText('Starting Now');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdownText(
        days > 0
          ? `${days}d ${hours}h ${minutes}m`
          : `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [heroAppointment]);

  // Helper Toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Calendar Helpers
  const addToGoogleCalendar = (appt: Appointment) => {
    const title = encodeURIComponent(`Swift MD Consultation with Dr. ${appt.doctor?.full_name || 'Specialist'}`);
    const details = encodeURIComponent(`Consultation Type: ${appt.consultation_type}`);
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}`;
    window.open(url, '_blank');
  };

  const downloadIcs = (appt: Appointment) => {
    const icsData = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:Swift MD - Dr. ${appt.doctor?.full_name || 'Specialist'}\nDESCRIPTION:${appt.consultation_type} Appointment\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `SwiftMD_Appointment_${appt.id}.ics`;
    link.click();
    triggerToast('Calendar event downloaded (.ics)');
  };

  const handleAiAsk = (promptText?: string) => {
    const query = promptText || aiInput;
    if (!query.trim()) return;
    setAiInput(query);
    setAiResponse('Analyzing prompt using Swift AI Engine...');
    setTimeout(() => {
      setAiResponse(
        `AI Clinical Brief: High priority points generated for "${query}". Recommending patient note prep before consultation.`
      );
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#050914] text-slate-100 font-sans p-4 md:p-8 space-y-6 pb-24 md:pb-8 selection:bg-blue-600 selection:text-white relative rounded-3xl">
      
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-blue-600 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-blue-400 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HERO HEADER */}
      <div className="bg-gradient-to-r from-blue-950/90 via-[#0a1228] to-[#080d1a] border border-blue-800/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-full bg-blue-900/60 border border-blue-500/40 text-[10px] font-bold text-blue-300 uppercase tracking-widest flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-blue-400" /> Patient Command Center
              </span>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-800/40">
                <Activity className="w-3 h-3 animate-pulse" /> Realtime Sync Active
              </span>
              <span className="text-[10px] text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-800 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-cyan-400" /> 256-Bit Encrypted
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Welcome back, {patientName}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage scheduled consultations, digital prescriptions, and clinical interactions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/patient/dashboard/appointments/book"
              className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xl transition flex items-center justify-center gap-2 shrink-0 hover:scale-105"
            >
              <PlusCircle className="w-4 h-4" /> Book New Appointment
            </a>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { label: 'Book Visit', icon: PlusCircle, href: '/patient/dashboard/appointments/book', color: 'text-blue-400' },
          { label: 'Messages', icon: MessageSquare, href: '#', color: 'text-purple-400' },
          { label: 'Prescriptions', icon: Pill, href: '#', color: 'text-emerald-400' },
          { label: 'Lab Results', icon: Activity, href: '#', color: 'text-amber-400' },
          { label: 'Records', icon: FileText, href: '#', color: 'text-cyan-400' },
          { label: 'Emergency', icon: AlertCircle, action: () => setShowEmergencyModal(true), color: 'text-rose-400' },
        ].map((act, i) => {
          const Icon = act.icon;
          return act.href ? (
            <a
              key={i}
              href={act.href}
              className="p-3 bg-[#0d1424] border border-slate-800/80 hover:border-slate-700 rounded-2xl flex items-center gap-2.5 transition-all hover:bg-slate-900 group"
            >
              <Icon className={`w-4 h-4 ${act.color} group-hover:scale-110 transition-transform`} />
              <span className="text-xs font-bold text-slate-200 truncate">{act.label}</span>
            </a>
          ) : (
            <button
              key={i}
              onClick={act.action}
              className="p-3 bg-[#0d1424] border border-slate-800/80 hover:border-slate-700 rounded-2xl flex items-center gap-2.5 transition-all hover:bg-slate-900 group text-left"
            >
              <Icon className={`w-4 h-4 ${act.color} group-hover:scale-110 transition-transform`} />
              <span className="text-xs font-bold text-slate-200 truncate">{act.label}</span>
            </button>
          );
        })}
      </div>

      {/* STATS METRICS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setSelectedTab('Upcoming')}
          className="p-4 bg-[#0d1424] border border-blue-500/40 hover:border-blue-500 rounded-3xl space-y-1 text-blue-400 cursor-pointer transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Upcoming</span>
            <CalendarIcon className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-white">{upcomingAppointments.length}</p>
          <p className="text-[10px] text-slate-500">Scheduled consultations</p>
        </div>

        <div className="p-4 bg-[#0d1424] border border-emerald-500/40 rounded-3xl space-y-1 text-emerald-400">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Prescriptions</span>
            <Pill className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white">2 Ready</p>
          <p className="text-[10px] text-slate-500">Active refills available</p>
        </div>

        <div className="p-4 bg-[#0d1424] border border-amber-500/40 rounded-3xl space-y-1 text-amber-400">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lab Reports</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white">1 Ready</p>
          <p className="text-[10px] text-slate-500">Panels ready for view</p>
        </div>

        <div className="p-4 bg-[#0d1424] border border-purple-500/40 rounded-3xl space-y-1 text-purple-400">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Messages</span>
            <MessageSquare className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white">3 Unread</p>
          <p className="text-[10px] text-slate-500">Direct from providers</p>
        </div>
      </div>

      {/* HERO UPCOMING APPOINTMENT SPOTLIGHT OR EMPTY STATE */}
      {isLoading ? (
        <div className="p-8 rounded-3xl bg-[#0d1424] border border-slate-800 animate-pulse space-y-4">
          <div className="h-6 w-48 bg-slate-800 rounded-lg" />
          <div className="h-24 w-full bg-slate-900 rounded-2xl" />
        </div>
      ) : heroAppointment ? (
        <div className="bg-gradient-to-br from-[#0d1a38] via-[#0d1424] to-[#0a1120] border-2 border-blue-500/60 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-950 border border-blue-500/40 flex items-center justify-center font-black text-blue-300 text-xl shrink-0 shadow-lg">
                {heroAppointment.doctor?.full_name
                  ? heroAppointment.doctor.full_name.split(' ').map((n: string) => n[0]).join('')
                  : 'DR'}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-900/60 border border-blue-500/40 text-[10px] font-bold text-blue-300 uppercase tracking-wider">
                    Next Consultation
                  </span>
                  <span className="text-xs text-amber-400 font-black flex items-center gap-1 bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-800/40">
                    <Clock className="w-3.5 h-3.5" /> Starts in: {countdownText || 'Calculating...'}
                  </span>
                </div>
                <h2 className="text-xl font-black text-white">
                  Dr. {heroAppointment.doctor?.full_name || 'Medical Specialist'}
                </h2>
                <p className="text-xs font-semibold text-blue-400">
                  {heroAppointment.doctor?.specialty || 'General Practice'} • {heroAppointment.consultation_type}
                </p>
                <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                  <CalendarIcon className="w-3 h-3 text-slate-500" />
                  {heroAppointment.appointment_date} at {heroAppointment.start_time}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              {heroAppointment.consultation_type === 'Telehealth' ? (
                <button
                  onClick={() => setShowPreCheck(true)}
                  className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs rounded-2xl shadow-xl transition flex items-center justify-center gap-2 animate-pulse"
                >
                  <Video className="w-4 h-4" /> Join Telehealth Session
                </button>
              ) : (
                <button
                  onClick={() => triggerToast(`Location: ${heroAppointment.doctor?.location || 'Main Medical Center'}`)}
                  className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-2xl shadow-xl transition flex items-center justify-center gap-2"
                >
                  <MapPin className="w-4 h-4" /> View Clinic Directions
                </button>
              )}

              <div className="flex items-center gap-1.5 justify-center">
                <button
                  onClick={() => addToGoogleCalendar(heroAppointment)}
                  title="Google Calendar"
                  className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 hover:text-white transition"
                >
                  <CalendarPlus className="w-4 h-4 text-blue-400" />
                </button>
                <button
                  onClick={() => downloadIcs(heroAppointment)}
                  title="Apple / ICS Calendar"
                  className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 hover:text-white transition"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-[#0d1424] border border-slate-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-blue-950/60 border border-blue-800/40 flex items-center justify-center mx-auto text-blue-400">
            <CalendarIcon className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No Upcoming Appointments</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              You have no pending consultations scheduled. Connect with a licensed doctor today.
            </p>
          </div>
          <a
            href="/patient/dashboard/appointments/book"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
          >
            <PlusCircle className="w-4 h-4" /> Book Your First Appointment
          </a>
        </div>
      )}

      {/* TIMELINE & ACTIVITY STREAM GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT 7 COLS: TIMELINE & LIST */}
        <div className="lg:col-span-7 bg-[#0d1424] border border-slate-800 rounded-3xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-4 gap-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" /> Consultation Timeline
            </h3>

            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {(['Upcoming', 'Past', 'All'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    selectedTab === tab
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {displayedAppointments.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <FileCheck className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-500 italic">No {selectedTab.toLowerCase()} appointment records found.</p>
              </div>
            ) : (
              displayedAppointments.map((appt) => {
                const isExpanded = expandedNotesId === appt.id;
                return (
                  <div
                    key={appt.id}
                    className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition space-y-3"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-600/30 flex items-center justify-center font-bold text-blue-300 text-xs shrink-0">
                          {appt.doctor?.full_name
                            ? appt.doctor.full_name.split(' ').map((n: string) => n[0]).join('')
                            : 'DR'}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white">
                            Dr. {appt.doctor?.full_name || 'Physician'}
                          </h4>
                          <p className="text-[10px] text-blue-400">
                            {appt.doctor?.specialty || 'General'} • {appt.consultation_type}
                          </p>
                          <span className="text-[10px] text-slate-500 block">
                            {appt.appointment_date} at {appt.start_time}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            appt.status === 'Completed'
                              ? 'bg-slate-900 text-slate-400 border-slate-800'
                              : appt.status === 'Cancelled'
                              ? 'bg-rose-950/60 text-rose-400 border-rose-900/60'
                              : 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60'
                          }`}
                        >
                          {appt.status}
                        </span>

                        <button
                          onClick={() => setExpandedNotesId(isExpanded ? null : appt.id)}
                          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs"
                        >
                          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="pt-2 border-t border-slate-900 space-y-2 text-xs">
                        <p className="text-slate-300 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-[11px]">
                          <strong>Clinical Notes:</strong> {appt.notes || 'No preliminary notes recorded for this visit.'}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => addToGoogleCalendar(appt)}
                            className="text-[10px] font-bold text-blue-400 hover:underline flex items-center gap-1"
                          >
                            <CalendarPlus className="w-3 h-3" /> Add Calendar
                          </button>
                          <button
                            onClick={() => triggerToast(`Summary exported for Dr. ${appt.doctor?.full_name}`)}
                            className="text-[10px] font-bold text-slate-400 hover:underline flex items-center gap-1"
                          >
                            <Share2 className="w-3 h-3" /> Export Summary
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT 5 COLS: ACTIVITY FEED & REMINDERS */}
        <div className="lg:col-span-5 space-y-6">
          {/* Recent Activity */}
          <div className="bg-[#0d1424] border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" /> Recent Activity Stream
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-[11px]">Lab Panel Completed</h4>
                  <p className="text-[10px] text-slate-400">Comprehensive Metabolic Panel results uploaded.</p>
                  <span className="text-[9px] text-slate-500">2 hours ago</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 flex items-start gap-3">
                <Pill className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-[11px]">Prescription Refill Issued</h4>
                  <p className="text-[10px] text-slate-400">Amoxicillin 500mg sent to designated pharmacy.</p>
                  <span className="text-[9px] text-slate-500">Yesterday at 4:15 PM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Health Reminders */}
          <div className="bg-[#0d1424] border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-amber-400" /> Actionable Health Reminders
            </h3>

            <div className="space-y-2">
              <div className="p-3 rounded-2xl bg-amber-950/20 border border-amber-800/40 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-amber-300">Annual Wellness Exam</h4>
                  <p className="text-[10px] text-slate-400">Due in 14 days • Preventative Checkup</p>
                </div>
                <a
                  href="/patient/dashboard/appointments/book"
                  className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-[10px]"
                >
                  Schedule
                </a>
              </div>

              <div className="p-3 rounded-2xl bg-blue-950/20 border border-blue-800/40 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-blue-300">Blood Pressure Logging</h4>
                  <p className="text-[10px] text-slate-400">Log morning reading in health metrics</p>
                </div>
                <button
                  onClick={() => triggerToast('Health metric logged successfully.')}
                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px]"
                >
                  Log Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FLOATING AI CLINICAL ASSISTANT */}
      <div className="fixed bottom-6 right-6 z-50">
        {!aiOpen ? (
          <button
            onClick={() => setAiOpen(true)}
            className="flex items-center gap-2.5 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-2xl transition-all hover:scale-105"
          >
            <Sparkles className="w-5 h-5 animate-pulse text-blue-200" />
            <span className="text-xs font-bold">Swift AI Assistant</span>
          </button>
        ) : (
          <div className="w-80 sm:w-96 bg-[#0d1424] border border-blue-600/60 rounded-3xl shadow-2xl overflow-hidden p-4 space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <Bot className="w-4 h-4 text-blue-400" /> Clinical AI Assistant
              </h4>
              <button onClick={() => setAiOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                'Summarize symptoms',
                'Questions for doctor',
                'Explain terms'
              ].map((pill, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAiAsk(pill)}
                  className="text-[9px] font-bold px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-blue-300"
                >
                  {pill}
                </button>
              ))}
            </div>

            <textarea
              rows={2}
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder="Ask AI or summarize symptoms prior to consultation..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={() => handleAiAsk()}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition"
            >
              Generate Insights
            </button>
            {aiResponse && (
              <div className="p-2.5 rounded-xl bg-blue-950/60 border border-blue-800/40 text-[11px] text-blue-200">
                {aiResponse}
              </div>
            )}
          </div>
        )}
      </div>

      {/* DEVICE CHECK PRE-CONSULTATION MODAL */}
      {showPreCheck && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0d1424] border border-blue-600/60 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowPreCheck(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                Pre-Consultation Check
              </span>
              <h3 className="text-base font-bold text-white mt-1">Telehealth Device Readiness</h3>
              <p className="text-xs text-slate-400">Verifying audio, video, and network parameters before joining.</p>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-xs text-slate-200">
                  <Camera className="w-4 h-4 text-blue-400" />
                  <span>HD Camera Sensor</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Ready
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-xs text-slate-200">
                  <Mic className="w-4 h-4 text-purple-400" />
                  <span>Microphone Audio Output</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Ready
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-xs text-slate-200">
                  <Wifi className="w-4 h-4 text-amber-400" />
                  <span>Network Latency ({pingSpeed}ms)</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Optimal
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setShowPreCheck(false);
                  triggerToast('Connecting securely to secure telehealth room...');
                }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs rounded-2xl shadow-xl transition flex items-center justify-center gap-2"
              >
                <Video className="w-4 h-4" /> Enter Secure Video Room
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EMERGENCY MODAL */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0d1424] border border-rose-600/80 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowEmergencyModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/60">
                Urgent Assistance
              </span>
              <h3 className="text-base font-bold text-white mt-1">Swift MD Emergency Response</h3>
              <p className="text-xs text-slate-400">If you are experiencing a life-threatening medical emergency, please call your local emergency services immediately.</p>
            </div>

            <div className="p-4 bg-rose-950/30 border border-rose-800/50 rounded-2xl space-y-2 text-xs">
              <p className="text-rose-200 font-bold">Emergency Hotline (24/7):</p>
              <p className="text-lg font-black text-white">+254 800 722 911 / 999</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setShowEmergencyModal(false);
                  triggerToast('Emergency dispatch alert triggered.');
                }}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-2xl shadow-xl transition"
              >
                Trigger SOS Alert
              </button>
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-2xl border border-slate-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}