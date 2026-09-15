"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Copy,
  Calendar as CalendarIcon,
  Clock,
  User,
  Check,
  Video,
  UserCheck,
  Zap,
  Lock,
  Plus,
  Trash2,
  Sliders,
  Sparkles,
  Building2,
  Globe,
  Settings,
  X,
} from "lucide-react";

// --- TYPES ---
export type DayStatus =
  | "available"
  | "few_slots"
  | "nearly_full"
  | "fully_booked"
  | "off"
  | "leave"
  | "holiday";

export interface Shift {
  id: string;
  name: string; // Morning, Afternoon, Evening
  startTime: string; // e.g., "08:00"
  endTime: string; // e.g., "12:00"
  isTelehealth: boolean;
  isInPerson: boolean;
  maxPatients: number;
}

export interface Appointment {
  id: string;
  time: string;
  patientName: string;
  type: "telehealth" | "in_person";
  status: "confirmed" | "completed" | "cancelled";
}

export interface DaySchedule {
  dateStr: string; // YYYY-MM-DD
  status: DayStatus;
  shifts: Shift[];
  appointments: Appointment[];
  maxDailyPatients: number;
  bufferMinutes: number;
  autoBreakCount: number;
  clinicLocation: string;
  isEmergencyAvailable: boolean;
}

// --- COLOR MAPS ---
const STATUS_COLORS: Record<
  DayStatus,
  { bg: string; border: string; text: string; dot: string; label: string }
> = {
  available: {
    bg: "bg-emerald-50 hover:bg-emerald-100",
    border: "border-emerald-200",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    label: "Available",
  },
  few_slots: {
    bg: "bg-amber-50 hover:bg-amber-100",
    border: "border-amber-200",
    text: "text-amber-700",
    dot: "bg-amber-400",
    label: "Few slots left",
  },
  nearly_full: {
    bg: "bg-orange-50 hover:bg-orange-100",
    border: "border-orange-200",
    text: "text-orange-700",
    dot: "bg-orange-500",
    label: "Nearly full",
  },
  fully_booked: {
    bg: "bg-rose-50 hover:bg-rose-100",
    border: "border-rose-200",
    text: "text-rose-700",
    dot: "bg-rose-500",
    label: "Fully Booked",
  },
  off: {
    bg: "bg-slate-50 hover:bg-slate-100",
    border: "border-slate-200",
    text: "text-slate-500",
    dot: "bg-slate-400",
    label: "Off Duty",
  },
  leave: {
    bg: "bg-purple-50 hover:bg-purple-100",
    border: "border-purple-200",
    text: "text-purple-700",
    dot: "bg-purple-500",
    label: "On Leave",
  },
  holiday: {
    bg: "bg-sky-50 hover:bg-sky-100",
    border: "border-sky-200",
    text: "text-sky-700",
    dot: "bg-sky-500",
    label: "Public Holiday",
  },
};

export default function SwiftMDScheduleManager() {
  // Current Active Date Navigation (Dynamic state)
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 8, 15)); // Sep 2026
  const [selectedDateStr, setSelectedDateStr] = useState<string>("2026-09-16");
  const [viewMode, setViewMode] = useState<"month" | "week">("month");

  // Bulk Apply & Modal States
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedBulkDays, setSelectedBulkDays] = useState<number[]>([
    1, 2, 3, 4, 5,
  ]); // Mon-Fri default

  // Telehealth & Practice Preferences
  const [clinicLocation, setClinicLocation] = useState("Nairobi Main Clinic");
  const [timezone, setTimezone] = useState("Africa/Nairobi (EAT +03:00)");

  // Schedule Storage State
  const [schedules, setSchedules] = useState<Record<string, DaySchedule>>({
    "2026-09-16": {
      dateStr: "2026-09-16",
      status: "available",
      shifts: [
        {
          id: "s1",
          name: "Morning",
          startTime: "08:00",
          endTime: "12:00",
          isTelehealth: true,
          isInPerson: true,
          maxPatients: 5,
        },
        {
          id: "s2",
          name: "Afternoon",
          startTime: "13:00",
          endTime: "17:00",
          isTelehealth: true,
          isInPerson: false,
          maxPatients: 5,
        },
      ],
      appointments: [
        {
          id: "a1",
          time: "09:00 AM",
          patientName: "James Mwangi",
          type: "in_person",
          status: "confirmed",
        },
        {
          id: "a2",
          time: "10:30 AM",
          patientName: "Sarah Korir",
          type: "telehealth",
          status: "confirmed",
        },
        {
          id: "a3",
          time: "02:00 PM",
          patientName: "David Omondi",
          type: "telehealth",
          status: "confirmed",
        },
        {
          id: "a4",
          time: "03:15 PM",
          patientName: "Mercy Chebet",
          type: "telehealth",
          status: "confirmed",
        },
        {
          id: "a5",
          time: "04:30 PM",
          patientName: "Brian Otieno",
          type: "telehealth",
          status: "confirmed",
        },
      ],
      maxDailyPatients: 10,
      bufferMinutes: 15,
      autoBreakCount: 5,
      clinicLocation: "Nairobi Main Clinic",
      isEmergencyAvailable: true,
    },
  });

  // Calendar Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handlePrevMonth = () =>
    setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () =>
    setCurrentDate(new Date(year, month + 1, 1));
  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split("T")[0]);
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  // Selected Day Schedule Getter
  const selectedDayData: DaySchedule = useMemo(() => {
    return (
      schedules[selectedDateStr] || {
        dateStr: selectedDateStr,
        status: "off",
        shifts: [],
        appointments: [],
        maxDailyPatients: 10,
        bufferMinutes: 15,
        autoBreakCount: 5,
        clinicLocation: clinicLocation,
        isEmergencyAvailable: false,
      }
    );
  }, [schedules, selectedDateStr, clinicLocation]);

  // Live Summary Aggregator
  const monthSummary = useMemo(() => {
    let available = 0;
    let booked = 0;
    let off = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
      const sched = schedules[dStr];
      if (!sched || sched.status === "off") {
        off++;
      } else if (sched.status === "fully_booked") {
        booked++;
      } else {
        available++;
      }
    }
    return { available, booked, off };
  }, [schedules, year, month, daysInMonth]);

  // --- ACTIONS ---
  const updateSelectedDayStatus = (newStatus: DayStatus) => {
    setSchedules((prev) => ({
      ...prev,
      [selectedDateStr]: {
        ...selectedDayData,
        status: newStatus,
        shifts:
          newStatus === "available" && selectedDayData.shifts.length === 0
            ? [
                {
                  id: "s1",
                  name: "Morning",
                  startTime: "08:00",
                  endTime: "12:00",
                  isTelehealth: true,
                  isInPerson: true,
                  maxPatients: 5,
                },
                {
                  id: "s2",
                  name: "Afternoon",
                  startTime: "13:00",
                  endTime: "17:00",
                  isTelehealth: true,
                  isInPerson: false,
                  maxPatients: 5,
                },
              ]
            : selectedDayData.shifts,
      },
    }));
  };

  const toggleEmergencyAvailability = () => {
    setSchedules((prev) => ({
      ...prev,
      [selectedDateStr]: {
        ...selectedDayData,
        isEmergencyAvailable: !selectedDayData.isEmergencyAvailable,
      },
    }));
  };

  const applyBulkSchedule = () => {
    const updated = { ...schedules };
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month, day);
      const dayOfWeek = dateObj.getDay(); // 0 = Sun, 1 = Mon ...
      if (selectedBulkDays.includes(dayOfWeek)) {
        const dStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
          day
        ).padStart(2, "0")}`;
        updated[dStr] = {
          ...selectedDayData,
          dateStr: dStr,
          status: "available",
        };
      }
    }
    setSchedules(updated);
    setIsBulkModalOpen(false);
  };

  const clearEntireMonth = () => {
    if (confirm("Are you sure you want to clear all schedules for this month?")) {
      const updated = { ...schedules };
      for (let day = 1; day <= daysInMonth; day++) {
        const dStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
          day
        ).padStart(2, "0")}`;
        delete updated[dStr];
      }
      setSchedules(updated);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-6 space-y-6">
      {/* TOP HEADER & ACTION BAR */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2.5 py-1 rounded-md">
                Practice Management
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" /> {timezone}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              Schedule & Availability Manager
            </h1>
          </div>

          {/* Quick Actions & Live Summary */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-3 bg-slate-100 px-3.5 py-1.5 rounded-xl text-xs font-medium mr-2">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {monthSummary.available} Available
              </span>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-1.5 text-rose-700">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                {monthSummary.booked} Booked
              </span>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                {monthSummary.off} Off
              </span>
            </div>

            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors shadow-sm"
            >
              <Copy className="w-3.5 h-3.5" />
              Bulk Recurring Apply
            </button>
            <button
              onClick={clearEntireMonth}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Month
            </button>
          </div>
        </div>

        {/* MONTH / NAVIGATION CONTROLS */}
        <div className="flex flex-wrap items-center justify-between border-t border-slate-100 pt-4 gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200/60">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-white rounded-lg text-slate-600 transition-all shadow-xs"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-4 text-sm font-bold text-slate-800 min-w-[140px] text-center">
                {monthNames[month]} {year}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-white rounded-lg text-slate-600 transition-all shadow-xs"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleToday}
              className="bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Today
            </button>
          </div>

          {/* Location & AI Assistant Prompt */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs text-slate-600">
              <Building2 className="w-3.5 h-3.5 text-teal-600" />
              <select
                value={clinicLocation}
                onChange={(e) => setClinicLocation(e.target.value)}
                className="bg-transparent font-medium focus:outline-none cursor-pointer"
              >
                <option value="Nairobi Main Clinic">Nairobi Main Clinic</option>
                <option value="Juja Medical Center">Juja Medical Center</option>
                <option value="Telehealth Only (Remote)">Telehealth Only (Remote)</option>
              </select>
            </div>

            <button className="flex items-center gap-1.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-xs font-medium px-3 py-2 rounded-xl hover:opacity-95 transition-opacity shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              AI Auto-Optimize
            </button>
          </div>
        </div>
      </div>

      {/* MAIN GRID LAYOUT: CALENDAR + RIGHT EDIT PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* CALENDAR MATRIX (8 COLS) */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-teal-600" />
              Monthly Availability Matrix
            </h2>
            {/* Status Legend */}
            <div className="hidden sm:flex items-center gap-3 text-[11px] font-medium text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Available
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-500" /> Booked
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-400" /> Off
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-500" /> Leave
              </span>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 text-center text-xs font-bold text-slate-400 tracking-wider">
            <span>SUN</span>
            <span>MON</span>
            <span>TUE</span>
            <span>WED</span>
            <span>THU</span>
            <span>FRI</span>
            <span>SAT</span>
          </div>

          {/* Day Cards Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Blank leading slots */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="h-24 bg-slate-50/50 rounded-xl border border-slate-100"
              />
            ))}

            {/* Actual Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dStr = `${year}-${String(month + 1).padStart(
                2,
                "0"
              )}-${String(dayNum).padStart(2, "0")}`;
              const dayData = schedules[dStr] || {
                dateStr: dStr,
                status: "off",
                shifts: [],
                appointments: [],
              };

              const isSelected = selectedDateStr === dStr;
              const style = STATUS_COLORS[dayData.status];
              const bookedCount = dayData.appointments.length;
              const isLocked = dayData.status === "fully_booked";

              return (
                <button
                  key={dStr}
                  onClick={() => setSelectedDateStr(dStr)}
                  className={`h-24 rounded-xl p-2 border text-left transition-all relative flex flex-col justify-between group ${
                    style.bg
                  } ${
                    isSelected
                      ? "ring-2 ring-teal-600 border-teal-600 shadow-md scale-[1.02] z-10"
                      : style.border
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-bold ${
                        isSelected ? "text-teal-900" : "text-slate-700"
                      }`}
                    >
                      {dayNum}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                  </div>

                  {/* Shifts & Patient Details */}
                  <div className="space-y-1">
                    {dayData.status !== "off" ? (
                      <>
                        <div className="text-[10px] font-medium text-slate-600 truncate flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 text-slate-400" />
                          08:00–17:00
                        </div>
                        <div className="text-[10px] font-semibold text-slate-700 flex items-center justify-between">
                          <span>{bookedCount} patients</span>
                          {isLocked && <Lock className="w-2.5 h-2.5 text-rose-500" />}
                        </div>
                      </>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-400 italic">
                        Off Duty
                      </span>
                    )}
                  </div>

                  {/* Telehealth Badge Indicator */}
                  {dayData.shifts.some((s) => s.isTelehealth) && (
                    <div className="absolute top-1.5 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Video className="w-2.5 h-2.5 text-teal-600" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT EDIT PANEL & APPOINTMENT LIST (4 COLS) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-5">
          {/* DAY CONFIGURATION CARD */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Selected Date
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {new Date(selectedDateStr).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </h3>
              </div>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                  STATUS_COLORS[selectedDayData.status].bg
                } ${STATUS_COLORS[selectedDayData.status].text}`}
              >
                {STATUS_COLORS[selectedDayData.status].label}
              </span>
            </div>

            {/* Quick Status Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600">
                Set Day Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => updateSelectedDayStatus("available")}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                    selectedDayData.status === "available"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                  }`}
                >
                  Available
                </button>
                <button
                  onClick={() => updateSelectedDayStatus("fully_booked")}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                    selectedDayData.status === "fully_booked"
                      ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                      : "bg-white text-rose-700 border-rose-200 hover:bg-rose-50"
                  }`}
                >
                  Booked
                </button>
                <button
                  onClick={() => updateSelectedDayStatus("off")}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                    selectedDayData.status === "off"
                      ? "bg-slate-800 text-white border-slate-800 shadow-xs"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  Off Duty
                </button>
              </div>
            </div>

            {/* Emergency & Telehealth Controls */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" /> Emergency On-Call
                </span>
                <input
                  type="checkbox"
                  checked={selectedDayData.isEmergencyAvailable}
                  onChange={toggleEmergencyAvailability}
                  className="w-4 h-4 text-teal-600 rounded-sm focus:ring-teal-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/50">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-teal-600" /> Accept Telehealth Calls
                </span>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-teal-600 rounded-sm focus:ring-teal-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Shift Details & Editor */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Working Shifts
                </h4>
                <button className="text-xs font-semibold text-teal-600 hover:underline flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add Shift
                </button>
              </div>

              {selectedDayData.shifts.length > 0 ? (
                <div className="space-y-2">
                  {selectedDayData.shifts.map((shift) => (
                    <div
                      key={shift.id}
                      className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-800 block">
                          {shift.name} Shift
                        </span>
                        <span className="text-slate-500">
                          {shift.startTime} – {shift.endTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {shift.isTelehealth && (
                          <span className="px-2 py-0.5 bg-teal-100 text-teal-700 font-medium text-[10px] rounded-md">
                            Telehealth
                          </span>
                        )}
                        {shift.isInPerson && (
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 font-medium text-[10px] rounded-md">
                            Clinic
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  No active shifts configured for this day.
                </p>
              )}
            </div>

            {/* APPOINTMENT LIST FOR SELECTED DAY */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Booked Patients ({selectedDayData.appointments.length})
                </h4>
                <span className="text-xs text-slate-400 font-medium">
                  Capacity: {selectedDayData.appointments.length}/10
                </span>
              </div>

              {selectedDayData.appointments.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedDayData.appointments.map((app) => (
                    <div
                      key={app.id}
                      className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between hover:border-teal-300 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">
                            {app.patientName}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {app.time}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                          app.type === "telehealth"
                            ? "bg-teal-50 text-teal-700"
                            : "bg-indigo-50 text-indigo-700"
                        }`}
                      >
                        {app.type === "telehealth" ? "Virtual" : "In-Person"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  No appointments booked for this date yet.
                </p>
              )}
            </div>

            <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-sm">
              <Check className="w-4 h-4 text-emerald-400" /> Save Schedule Changes
            </button>
          </div>
        </div>
      </div>

      {/* BULK RECURRING SCHEDULE MODAL */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Copy className="w-4 h-4 text-teal-600" />
                Bulk Apply Weekly Schedule
              </h3>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Select days of the week to automatically copy the shift template
              across the entire month of <strong>{monthNames[month]} {year}</strong>.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">
                Repeat On Days:
              </label>
              <div className="grid grid-cols-7 gap-1.5">
                {[
                  { label: "S", day: 0 },
                  { label: "M", day: 1 },
                  { label: "T", day: 2 },
                  { label: "W", day: 3 },
                  { label: "T", day: 4 },
                  { label: "F", day: 5 },
                  { label: "S", day: 6 },
                ].map((item) => {
                  const isChecked = selectedBulkDays.includes(item.day);
                  return (
                    <button
                      key={item.day}
                      onClick={() => {
                        setSelectedBulkDays((prev) =>
                          isChecked
                            ? prev.filter((d) => d !== item.day)
                            : [...prev, item.day]
                        );
                      }}
                      className={`h-10 text-xs font-bold rounded-xl border transition-all ${
                        isChecked
                          ? "bg-teal-600 text-white border-teal-600 shadow-xs"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setSelectedBulkDays([1, 2, 3, 4, 5])}
                className="text-[11px] font-semibold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-lg hover:bg-teal-100"
              >
                Select Mon–Fri
              </button>
              <button
                onClick={() => setSelectedBulkDays([0, 6])}
                className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg hover:bg-slate-200"
              >
                Select Weekends
              </button>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={applyBulkSchedule}
                className="px-4 py-2 text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700 rounded-xl transition-colors shadow-sm"
              >
                Apply Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}