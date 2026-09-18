'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  ShieldCheck, Clock, CheckCircle2, Video, MapPin,
  PlusCircle, MessageSquare, FileText, Pill, Activity, AlertCircle,
  Calendar as CalendarIcon, Sparkles, Bot, X
} from 'lucide-react';

export default function PatientAppointmentsDashboard() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTab, setSelectedTab] = useState<'Upcoming' | 'Past' | 'All'>('Upcoming');
  const [aiOpen, setAiOpen] = useState<boolean>(false);
  const [aiInput, setAiInput] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAppointments() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .select(`*, doctor:doctors(*)`)
        .order('appointment_date', { ascending: true });

      if (!error && data) {
        setAppointments(data);
      }
      setIsLoading(false);
    }

    fetchAppointments();

    const channel = supabase
      .channel('realtime_appointments_dashboard_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        fetchAppointments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const upcomingAppointments = appointments.filter(
    (a) => a.status === 'Scheduled' || a.status === 'In Progress' || a.status === 'Confirmed'
  );
  const heroAppointment = upcomingAppointments[0] || null;

  return (
    <div className="min-h-screen bg-[#050914] text-slate-100 font-sans p-4 md:p-8 space-y-6 pb-24 md:pb-8 selection:bg-blue-600 selection:text-white relative rounded-3xl">
      
      {/* HERO HEADER */}
      <div className="bg-gradient-to-r from-blue-950/80 via-[#0a1228] to-[#080d1a] border border-blue-800/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-full bg-blue-900/50 border border-blue-600/40 text-[10px] font-bold text-blue-300 uppercase tracking-widest flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-blue-400" /> Patient Command Center
              </span>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-800/40">
                <Activity className="w-3 h-3" /> Realtime Sync Active
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">My Appointments</h1>
            <p className="text-xs text-slate-400 mt-1">Manage scheduled consultations, digital prescriptions, and clinical interactions.</p>
          </div>

          <a
            href="/patient/dashboard/appointments/book"
            className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xl transition flex items-center justify-center gap-2 shrink-0 hover:scale-105"
          >
            <PlusCircle className="w-4 h-4" /> Book New Appointment
          </a>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { label: 'Book Visit', icon: PlusCircle, href: '/patient/dashboard/appointments/book', color: 'text-blue-400' },
          { label: 'Messages', icon: MessageSquare, href: '#', color: 'text-purple-400' },
          { label: 'Prescriptions', icon: Pill, href: '#', color: 'text-emerald-400' },
          { label: 'Lab Results', icon: Activity, href: '#', color: 'text-amber-400' },
          { label: 'Records', icon: FileText, href: '#', color: 'text-cyan-400' },
          { label: 'Emergency', icon: AlertCircle, href: '#', color: 'text-rose-400' },
        ].map((act, i) => {
          const Icon = act.icon;
          return (
            <a
              key={i}
              href={act.href}
              className="p-3 bg-[#0d1424] border border-slate-800/80 hover:border-slate-700 rounded-2xl flex items-center gap-2.5 transition-all hover:bg-slate-900 group"
            >
              <Icon className={`w-4 h-4 ${act.color} group-hover:scale-110 transition-transform`} />
              <span className="text-xs font-bold text-slate-200 truncate">{act.label}</span>
            </a>
          );
        })}
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-[#0d1424] border border-blue-500/40 rounded-3xl space-y-1 text-blue-400">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Upcoming</span>
            <CalendarIcon className="w-4 h-4" />
          </div>
          <p className="text-xl font-black text-white">{upcomingAppointments.length}</p>
          <p className="text-[10px] text-slate-500">Scheduled visits</p>
        </div>

        <div className="p-4 bg-[#0d1424] border border-emerald-500/40 rounded-3xl space-y-1 text-emerald-400">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prescriptions</span>
            <Pill className="w-4 h-4" />
          </div>
          <p className="text-xl font-black text-white">2 Ready</p>
          <p className="text-[10px] text-slate-500">Active refills available</p>
        </div>

        <div className="p-4 bg-[#0d1424] border border-amber-500/40 rounded-3xl space-y-1 text-amber-400">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lab Reports</span>
            <Activity className="w-4 h-4" />
          </div>
          <p className="text-xl font-black text-white">1 New</p>
          <p className="text-[10px] text-slate-500">Panels ready for view</p>
        </div>

        <div className="p-4 bg-[#0d1424] border border-purple-500/40 rounded-3xl space-y-1 text-purple-400">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Messages</span>
            <MessageSquare className="w-4 h-4" />
          </div>
          <p className="text-xl font-black text-white">3 Unread</p>
          <p className="text-[10px] text-slate-500">Direct from providers</p>
        </div>
      </div>

      {/* HERO APPOINTMENT CARD OR EMPTY STATE */}
      {isLoading ? (
        <div className="p-8 rounded-3xl bg-[#0d1424] border border-slate-800 animate-pulse space-y-4">
          <div className="h-6 w-48 bg-slate-800 rounded-lg" />
          <div className="h-20 w-full bg-slate-900 rounded-2xl" />
        </div>
      ) : heroAppointment ? (
        <div className="bg-gradient-to-br from-[#0d1a38] via-[#0d1424] to-[#0a1120] border-2 border-blue-500/60 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-950 border border-blue-500/40 flex items-center justify-center font-black text-blue-300 text-xl shrink-0 shadow-lg">
                {heroAppointment.doctor?.full_name ? heroAppointment.doctor.full_name.split(' ').map((n: string) => n[0]).join('') : 'DR'}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-900/60 border border-blue-600/40 text-[10px] font-bold text-blue-300 uppercase tracking-wider">
                    Next Appointment
                  </span>
                  <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {heroAppointment.appointment_date} @ {heroAppointment.start_time}
                  </span>
                </div>
                <h2 className="text-xl font-black text-white">Dr. {heroAppointment.doctor?.full_name || 'Medical Specialist'}</h2>
                <p className="text-xs font-semibold text-blue-400">{heroAppointment.doctor?.specialty || 'General Practice'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {heroAppointment.consultation_type === 'Telehealth' ? (
                <button className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs rounded-2xl shadow-xl transition flex items-center gap-2 animate-pulse">
                  <Video className="w-4 h-4" /> Join Video Session
                </button>
              ) : (
                <button className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-2xl shadow-xl transition flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> View Clinic Directions
                </button>
              )}
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
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">You have no pending consultations scheduled. Connect with a licensed doctor today.</p>
          </div>
          <a
            href="/patient/dashboard/appointments/book"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
          >
            Book Your First Appointment
          </a>
        </div>
      )}

      {/* TIMELINE & ACTIVITY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-[#0d1424] border border-slate-800 rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" /> Consultation Timeline
            </h3>

            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {(['Upcoming', 'Past', 'All'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${selectedTab === tab ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {appointments.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-6">No appointment records found.</p>
            ) : (
              appointments.map((appt) => (
                <div key={appt.id} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-600/30 flex items-center justify-center font-bold text-blue-300 text-xs shrink-0">
                      {appt.doctor?.full_name ? appt.doctor.full_name.split(' ').map((n: string) => n[0]).join('') : 'DR'}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Dr. {appt.doctor?.full_name || 'Physician'}</h4>
                      <p className="text-[10px] text-blue-400">{appt.doctor?.specialty} • {appt.consultation_type}</p>
                      <span className="text-[10px] text-slate-500 block">{appt.appointment_date} at {appt.start_time}</span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                    {appt.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0d1424] border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" /> Recent Activity Stream
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-[11px]">Lab Panel Completed</h4>
                  <p className="text-[10px] text-slate-400">Comprehensive Metabolic Panel ready.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FLOATING AI ASSISTANT */}
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
          <div className="w-80 sm:w-96 bg-[#0d1424] border border-blue-800/60 rounded-3xl shadow-2xl overflow-hidden p-4 space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <Bot className="w-4 h-4 text-blue-400" /> Clinical AI Assistant
              </h4>
              <button onClick={() => setAiOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              rows={2}
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder="Ask AI or summarize symptoms..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
            />
            <button
              onClick={() => setAiResponse(`AI Summary generated for: "${aiInput}"`)}
              className="w-full py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
            >
              Generate Insights
            </button>
            {aiResponse && <p className="text-[11px] text-blue-300 bg-blue-950/40 p-2 rounded-xl">{aiResponse}</p>}
          </div>
        )}
      </div>
    </div>
  );
}