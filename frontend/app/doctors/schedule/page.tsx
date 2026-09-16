'use client';

import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Lock, 
  Video, 
  MapPin, 
  AlertCircle, 
  Check, 
  RotateCcw, 
  Copy, 
  Trash2, 
  Sliders, 
  Sparkles, 
  Plus, 
  X,
  ShieldAlert,
  Briefcase
} from 'lucide-react';

// Types
type StatusType = 'available' | 'few_left' | 'nearly_full' | 'fully_booked' | 'off_duty' | 'leave' | 'holiday';

interface ShiftConfig {
  enabled: boolean;
  time: string;
  telehealth: boolean;
  inPerson: boolean;
}

interface DayData {
  date: number;
  monthOffset: number; // -1 for prev, 0 for current, 1 for next
  status: StatusType;
  workingHours: string;
  patientCount: number;
  maxPatients: number;
  shifts: {
    morning: ShiftConfig;
    afternoon: ShiftConfig;
    evening: ShiftConfig;
  };
  appointments: { time: string; patient: string; type: string }[];
  bufferTime: number; // in mins
  emergencySwitch: boolean;
  location: string;
}

const statusColors: Record<StatusType, { bg: string; border: string; text: string; dot: string; label: string }> = {
  available: { bg: 'bg-emerald-950/40', border: 'border-emerald-800/60', text: 'text-emerald-400', dot: 'bg-emerald-500', label: 'Available' },
  few_left: { bg: 'bg-teal-950/40', border: 'border-teal-800/60', text: 'text-teal-400', dot: 'bg-teal-500', label: 'Few slots left' },
  nearly_full: { bg: 'bg-amber-950/40', border: 'border-amber-800/60', text: 'text-amber-450', dot: 'bg-amber-500', label: 'Nearly full' },
  fully_booked: { bg: 'bg-rose-950/40', border: 'border-rose-800/60', text: 'text-rose-400', dot: 'bg-rose-500', label: 'Fully booked' },
  off_duty: { bg: 'bg-neutral-900/40', border: 'border-neutral-800/60', text: 'text-neutral-500', dot: 'bg-neutral-600', label: 'Off Duty' },
  leave: { bg: 'bg-purple-950/40', border: 'border-purple-800/60', text: 'text-purple-400', dot: 'bg-purple-500', label: 'Leave' },
  holiday: { bg: 'bg-sky-950/40', border: 'border-sky-800/60', text: 'text-sky-400', dot: 'bg-sky-500', label: 'Holiday' },
};

export default function DoctorSchedulePage() {
  const [currentMonth, setCurrentMonth] = useState('September 2026');
  const [selectedDay, setSelectedDay] = useState<number>(16);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedBulkDays, setSelectedBulkDays] = useState<number[]>([14, 15, 16, 17, 18]);

  // Mock Days Data for September 2026
  const [scheduleData, setScheduleData] = useState<Record<number, DayData>>({
    16: {
      date: 16,
      monthOffset: 0,
      status: 'available',
      workingHours: '8:00 AM – 5:00 PM',
      patientCount: 5,
      maxPatients: 10,
      shifts: {
        morning: { enabled: true, time: '8:00–12:00', telehealth: true, inPerson: true },
        afternoon: { enabled: true, time: '1:00–5:00', telehealth: true, inPerson: false },
        evening: { enabled: false, time: 'Optional', telehealth: false, inPerson: false }
      },
      appointments: [
        { time: '9:00 AM', patient: 'James M.', type: 'Telehealth' },
        { time: '10:30 AM', patient: 'Sarah K.', type: 'In-Person' },
        { time: '2:00 PM', patient: 'David O.', type: 'Telehealth' },
        { time: '3:15 PM', patient: 'Amina W.', type: 'Telehealth' },
        { time: '4:00 PM', patient: 'Robert N.', type: 'In-Person' },
      ],
      bufferTime: 15,
      emergencySwitch: true,
      location: 'Main City Clinic - Room 302'
    },
    17: {
      date: 17,
      monthOffset: 0,
      status: 'nearly_full',
      workingHours: '8:00 AM – 5:00 PM',
      patientCount: 9,
      maxPatients: 10,
      shifts: {
        morning: { enabled: true, time: '8:00–12:00', telehealth: true, inPerson: true },
        afternoon: { enabled: true, time: '1:00–5:00', telehealth: true, inPerson: true },
        evening: { enabled: false, time: 'Optional', telehealth: false, inPerson: false }
      },
      appointments: [
        { time: '8:30 AM', patient: 'Grace M.', type: 'In-Person' },
        { time: '9:30 AM', patient: 'Brian L.', type: 'Telehealth' },
      ],
      bufferTime: 10,
      emergencySwitch: false,
      location: 'Main City Clinic - Room 302'
    },
    18: {
      date: 18,
      monthOffset: 0,
      status: 'fully_booked',
      workingHours: '8:00 AM – 4:00 PM',
      patientCount: 12,
      maxPatients: 12,
      shifts: {
        morning: { enabled: true, time: '8:00–12:00', telehealth: true, inPerson: true },
        afternoon: { enabled: true, time: '1:00–4:00', telehealth: true, inPerson: true },
        evening: { enabled: false, time: 'Optional', telehealth: false, inPerson: false }
      },
      appointments: [],
      bufferTime: 10,
      emergencySwitch: true,
      location: 'Virtual Care Hub'
    },
    21: {
      date: 21,
      monthOffset: 0,
      status: 'off_duty',
      workingHours: 'Off Duty',
      patientCount: 0,
      maxPatients: 0,
      shifts: {
        morning: { enabled: false, time: 'Off', telehealth: false, inPerson: false },
        afternoon: { enabled: false, time: 'Off', telehealth: false, inPerson: false },
        evening: { enabled: false, time: 'Off', telehealth: false, inPerson: false }
      },
      appointments: [],
      bufferTime: 15,
      emergencySwitch: false,
      location: 'Main City Clinic'
    }
  });

  const currentDayData = scheduleData[selectedDay] || {
    date: selectedDay,
    monthOffset: 0,
    status: 'off_duty',
    workingHours: 'Off Duty',
    patientCount: 0,
    maxPatients: 10,
    shifts: {
      morning: { enabled: false, time: '8:00–12:00', telehealth: true, inPerson: true },
      afternoon: { enabled: false, time: '1:00–5:00', telehealth: true, inPerson: true },
      evening: { enabled: false, time: 'Optional', telehealth: false, inPerson: false }
    },
    appointments: [],
    bufferTime: 15,
    emergencySwitch: false,
    location: 'Main City Clinic'
  };

  // Helper to update active day configuration
  const updateCurrentDay = (updates: Partial<DayData>) => {
    setScheduleData(prev => ({
      ...prev,
      [selectedDay]: {
        ...currentDayData,
        ...updates
      }
    }));
  };

  // Helper to toggle bulk day selection
  const toggleBulkDay = (day: number) => {
    setSelectedBulkDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Top Navigation & Header */}
      <header className="px-6 pt-4 pb-3 border-b border-slate-800/80 bg-[#0d111a]/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Left: Title & Live Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>Doctor Schedule & Availability</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 border border-blue-700/50">Swift MD Pro</span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Manage operating hours, telehealth capacities, and patient booking pipelines.</p>
            </div>

            {/* Live Summary Counter Pill */}
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl text-xs shadow-inner">
              <span className="flex items-center gap-1.5 font-medium text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> 18 Available
              </span>
              <span className="text-slate-600">•</span>
              <span className="font-medium text-amber-400">6 Booked</span>
              <span className="text-slate-600">•</span>
              <span className="font-medium text-slate-400">6 Off</span>
            </div>
          </div>

          {/* Right: Month Selector & Quick Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Month Selector */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 shadow-sm">
              <button 
                onClick={() => setCurrentMonth('August 2026')}
                className="p-1.5 hover:bg-slate-800 text-slate-300 rounded-lg transition"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 text-xs font-semibold tracking-wide text-slate-200">{currentMonth}</span>
              <button 
                onClick={() => setCurrentMonth('October 2026')}
                className="p-1.5 hover:bg-slate-800 text-slate-300 rounded-lg transition"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button 
              onClick={() => setSelectedDay(16)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium rounded-xl text-slate-200 transition shadow-sm"
            >
              Today
            </button>

            <button 
              onClick={() => setBulkMode(!bulkMode)}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition flex items-center gap-1.5 ${bulkMode ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/30' : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200'}`}
            >
              <Sliders className="w-3.5 h-3.5" /> Bulk Editor
            </button>
          </div>

        </div>

        {/* Quick Action Toolbar */}
        <div className="max-w-7xl mx-auto mt-2.5 pt-2 border-t border-slate-800/40 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <span className="text-slate-500 font-medium uppercase tracking-wider text-[10px]">Quick Actions:</span>
            <button className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800/80 rounded-lg text-slate-300 transition flex items-center gap-1 shrink-0">
              <Copy className="w-3 h-3 text-blue-400" /> Copy Last Week
            </button>
            <button className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800/80 rounded-lg text-slate-300 transition flex items-center gap-1 shrink-0">
              <RotateCcw className="w-3 h-3 text-teal-400" /> Apply to Whole Month
            </button>
            <button className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800/80 rounded-lg text-slate-300 transition flex items-center gap-1 shrink-0">
              <Sparkles className="w-3 h-3 text-purple-400" /> AI Optimize Hours
            </button>
          </div>
          <button className="px-2.5 py-1 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-900/50 rounded-lg text-rose-400 transition flex items-center gap-1 shrink-0">
            <Trash2 className="w-3 h-3" /> Clear Schedule
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left/Center: Calendar Grid Area (7 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
          
          {bulkMode && (
            <div className="bg-blue-950/30 border border-blue-800/60 rounded-2xl p-4 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-semibold text-blue-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-400" /> Bulk Schedule Mode Active
                </h4>
                <p className="text-slate-300 mt-0.5">Select days on the calendar grid to apply recurring rules (e.g., Weekdays 8 AM–5 PM).</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition shadow">
                  Apply to Selected ({selectedBulkDays.length})
                </button>
                <button onClick={() => setBulkMode(false)} className="p-1.5 hover:bg-slate-800 text-slate-400 rounded-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Weekday Header */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>

          {/* Calendar Month Grid */}
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, index) => {
              const dayNum = index - 1; // alignment simulation
              const isLeadOrTrail = dayNum < 1 || dayNum > 30;
              const actualDate = isLeadOrTrail ? (dayNum < 1 ? 30 + dayNum : dayNum - 30) : dayNum;
              const isSelected = selectedDay === actualDate && !isLeadOrTrail;
              
              // Mock statuses for visual variance
              let status: StatusType = 'available';
              if (actualDate % 7 === 0 || actualDate % 7 === 6) status = 'off_duty';
              else if (actualDate === 18) status = 'fully_booked';
              else if (actualDate === 17) status = 'nearly_full';
              else if (actualDate === 12) status = 'leave';
              else if (actualDate === 10) status = 'holiday';

              const config = statusColors[status];
              const isFullyBooked = status === 'fully_booked';

              return (
                <div
                  key={index}
                  onClick={() => {
                    if (!isLeadOrTrail) {
                      setSelectedDay(actualDate);
                      setIsMobileDrawerOpen(true);
                    }
                  }}
                  className={`relative min-h-[96px] sm:min-h-[110px] rounded-2xl p-2.5 flex flex-col justify-between transition-all cursor-pointer border ${
                    isLeadOrTrail ? 'opacity-30 bg-slate-950/20 border-slate-900' : `${config.bg} ${config.border} hover:border-slate-500`
                  } ${isSelected ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/20 border-blue-500' : ''}`}
                >
                  {/* Top row: Date Number & Status Dot */}
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-bold ${isSelected ? 'text-blue-400 font-extrabold' : 'text-slate-200'}`}>
                      {actualDate}
                    </span>
                    
                    <div className="flex items-center gap-1.5">
                      {isFullyBooked && <Lock className="w-3.5 h-3.5 text-rose-400" />}
                      <span className={`w-2 h-2 rounded-full ${config.dot}`} title={config.label}></span>
                    </div>
                  </div>

                  {/* Middle content: Working Hours & Patient load */}
                  {!isLeadOrTrail && status !== 'off_duty' && status !== 'leave' && status !== 'holiday' ? (
                    <div className="space-y-1 my-auto">
                      <div className="text-[11px] font-medium text-slate-300 truncate">
                        {actualDate === 18 ? '8:00 AM – 4:00 PM' : '8:00 AM – 5:00 PM'}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                        <Users className="w-3 h-3 text-slate-500" />
                        <span>{actualDate === 18 ? '12 patients' : actualDate === 17 ? '9 patients' : '5 patients'}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="my-auto text-[11px] font-medium italic text-slate-500 capitalize">
                      {status.replace('_', ' ')}
                    </div>
                  )}

                  {/* Bottom status badge indicator pill */}
                  <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px]">
                    <span className={`truncate ${config.text} font-medium`}>{config.label}</span>
                  </div>

                  {bulkMode && !isLeadOrTrail && (
                    <div className="absolute top-2 right-2">
                      <input 
                        type="checkbox" 
                        checked={selectedBulkDays.includes(actualDate)} 
                        onChange={() => toggleBulkDay(actualDate)}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0 w-3.5 h-3.5"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Status Legend */}
          <div className="bg-[#0f1420] border border-slate-800/80 rounded-2xl p-3 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-300 mt-2">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Available</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span> Few slots left</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Nearly full</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Fully booked</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-neutral-600"></span> Off Duty</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Leave</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span> Holiday</span>
          </div>

        </div>

        {/* Right Panel: Full Day Details & Shift Editor (Desktop & Mobile Drawer) */}
        <div className={`
          lg:col-span-5 xl:col-span-4 bg-[#0d121c] border border-slate-800 rounded-3xl p-5 flex flex-col gap-5 shadow-2xl
          fixed lg:relative inset-x-0 bottom-0 z-40 max-h-[90vh] lg:max-h-none overflow-y-auto transition-transform duration-300
          ${isMobileDrawerOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}
        `}>
          
          {/* Mobile Close Button */}
          <div className="flex items-center justify-between lg:hidden pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date Inspection Drawer</span>
            <button onClick={() => setIsMobileDrawerOpen(false)} className="p-1 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Header Info */}
          <div>
            <div className="text-xs font-semibold text-blue-400 tracking-wider uppercase">Selected Date</div>
            <h2 className="text-lg font-bold text-white mt-0.5">September {selectedDay}, 2026</h2>
          </div>

          {/* Status & Clinic Location Selector */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl">
              <span className="text-[11px] text-slate-400 font-medium block">Status</span>
              <select 
                value={currentDayData.status}
                onChange={(e) => updateCurrentDay({ status: e.target.value as StatusType })}
                className="mt-1 bg-slate-950 border border-slate-800 text-xs rounded-xl px-2.5 py-1.5 text-slate-200 w-full focus:outline-none focus:border-blue-500"
              >
                <option value="available">Available (Green)</option>
                <option value="few_left">Few slots left (Teal)</option>
                <option value="nearly_full">Nearly full (Orange)</option>
                <option value="fully_booked">Fully booked (Red)</option>
                <option value="off_duty">Off Duty (Grey)</option>
                <option value="leave">Leave (Purple)</option>
                <option value="holiday">Holiday (Blue)</option>
              </select>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl">
              <span className="text-[11px] text-slate-400 font-medium block">Clinic Location</span>
              <select 
                value={currentDayData.location}
                onChange={(e) => updateCurrentDay({ location: e.target.value })}
                className="mt-1 bg-slate-950 border border-slate-800 text-xs rounded-xl px-2.5 py-1.5 text-slate-200 w-full focus:outline-none focus:border-blue-500 truncate"
              >
                <option value="Main City Clinic - Room 302">Main City Clinic - Room 302</option>
                <option value="Westlands Medical Center">Westlands Medical Center</option>
                <option value="Virtual Care Hub">Virtual Care Hub</option>
              </select>
            </div>
          </div>

          {/* Working Hours & Shift Editor Table */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" /> Shift & Hours Configuration
              </h3>
              <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800/60 px-2 py-0.5 rounded-full">Swift MD Custom</span>
            </div>

            <div className="space-y-2 text-xs">
              {/* Morning Shift */}
              <div className="flex items-center justify-between bg-slate-950/80 border border-slate-800/80 p-2.5 rounded-xl">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={currentDayData.shifts.morning.enabled}
                    onChange={(e) => updateCurrentDay({
                      shifts: { ...currentDayData.shifts, morning: { ...currentDayData.shifts.morning, enabled: e.target.checked } }
                    })}
                    className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0 w-3.5 h-3.5"
                  />
                  <div>
                    <span className="font-semibold text-slate-200">Morning</span>
                    <div className="text-[10px] text-slate-400">8:00–12:00</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => updateCurrentDay({
                      shifts: { ...currentDayData.shifts, morning: { ...currentDayData.shifts.morning, telehealth: !currentDayData.shifts.morning.telehealth } }
                    })}
                    className={`p-1.5 rounded-lg border transition ${currentDayData.shifts.morning.telehealth ? 'bg-blue-950 border-blue-700 text-blue-400' : 'bg-slate-900 border-slate-800 text-slate-600'}`}
                    title="Telehealth toggle"
                  >
                    <Video className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => updateCurrentDay({
                      shifts: { ...currentDayData.shifts, morning: { ...currentDayData.shifts.morning, inPerson: !currentDayData.shifts.morning.inPerson } }
                    })}
                    className={`p-1.5 rounded-lg border transition ${currentDayData.shifts.morning.inPerson ? 'bg-teal-950 border-teal-700 text-teal-400' : 'bg-slate-900 border-slate-800 text-slate-600'}`}
                    title="In-Person toggle"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Afternoon Shift */}
              <div className="flex items-center justify-between bg-slate-950/80 border border-slate-800/80 p-2.5 rounded-xl">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={currentDayData.shifts.afternoon.enabled}
                    onChange={(e) => updateCurrentDay({
                      shifts: { ...currentDayData.shifts, afternoon: { ...currentDayData.shifts.afternoon, enabled: e.target.checked } }
                    })}
                    className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0 w-3.5 h-3.5"
                  />
                  <div>
                    <span className="font-semibold text-slate-200">Afternoon</span>
                    <div className="text-[10px] text-slate-400">1:00–5:00</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => updateCurrentDay({
                      shifts: { ...currentDayData.shifts, afternoon: { ...currentDayData.shifts.afternoon, telehealth: !currentDayData.shifts.afternoon.telehealth } }
                    })}
                    className={`p-1.5 rounded-lg border transition ${currentDayData.shifts.afternoon.telehealth ? 'bg-blue-950 border-blue-700 text-blue-400' : 'bg-slate-900 border-slate-800 text-slate-600'}`}
                    title="Telehealth toggle"
                  >
                    <Video className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => updateCurrentDay({
                      shifts: { ...currentDayData.shifts, afternoon: { ...currentDayData.shifts.afternoon, inPerson: !currentDayData.shifts.afternoon.inPerson } }
                    })}
                    className={`p-1.5 rounded-lg border transition ${currentDayData.shifts.afternoon.inPerson ? 'bg-teal-950 border-teal-700 text-teal-400' : 'bg-slate-900 border-slate-800 text-slate-600'}`}
                    title="In-Person toggle"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Telehealth Advanced Parameters */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200 block">Buffer Time</span>
                <span className="text-[10px] text-slate-400">Between consults</span>
              </div>
              <select 
                value={currentDayData.bufferTime}
                onChange={(e) => updateCurrentDay({ bufferTime: Number(e.target.value) })}
                className="bg-slate-950 border border-slate-800 text-xs rounded-lg px-2 py-1 text-slate-200"
              >
                <option value={5}>5m</option>
                <option value={10}>10m</option>
                <option value={15}>15m</option>
                <option value={30}>30m</option>
              </select>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200 block">Emergency Switch</span>
                <span className="text-[10px] text-rose-400">On-call urgent slots</span>
              </div>
              <input 
                type="checkbox" 
                checked={currentDayData.emergencySwitch}
                onChange={(e) => updateCurrentDay({ emergencySwitch: e.target.checked })}
                className="rounded border-slate-700 bg-slate-950 text-rose-600 focus:ring-0 w-4 h-4"
              />
            </div>
          </div>

          {/* Appointment Visibility Table */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-teal-400" /> Booked Appointments ({currentDayData.appointments.length})
              </h3>
              <span className="text-[10px] text-slate-400">Click to open consultation</span>
            </div>

            {currentDayData.appointments.length > 0 ? (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {currentDayData.appointments.map((app, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-950 border border-slate-800/60 p-2 rounded-xl text-xs hover:border-blue-700/50 cursor-pointer transition">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-blue-400 font-medium">{app.time}</span>
                      <span className="font-semibold text-slate-200">{app.patient}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300">{app.type}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-slate-500 italic bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
                No patient bookings scheduled for this date.
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button 
              onClick={() => alert(`Changes saved successfully for September ${selectedDay}, 2026!`)}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Save Changes
            </button>
            <button 
              onClick={() => alert(`Copied schedule configuration from Sep ${selectedDay} to other active weekdays.`)}
              className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-medium text-xs rounded-xl transition"
            >
              Copy to Others
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}