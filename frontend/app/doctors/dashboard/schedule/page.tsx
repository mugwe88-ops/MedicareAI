"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, CheckCircle, ChevronLeft, ChevronRight, Clock, ShieldCheck, UserCheck } from "lucide-react";

interface DaySlot {
  day: number;
  status: "available" | "busy" | "off";
  shifts: string;
}

export default function DoctorScheduleDashboard() {
  const [currentMonth] = useState("September 2026");
  const [feedback, setFeedback] = useState<string | null>(null);

  // Mock initial schedule state for the month
  const [days, setDays] = useState<DaySlot[]>(
    Array.from({ length: 30 }, (_, index) => ({
      day: index + 1,
      status: index % 7 === 0 ? "off" : index % 3 === 0 ? "busy" : "available",
      shifts: index % 7 === 0 ? "Off Duty" : "09:00 AM - 04:00 PM",
    }))
  );

  const [selectedDay, setSelectedDay] = useState<DaySlot | null>(days[0]);

  const handleStatusChange = (newStatus: "available" | "busy" | "off") => {
    if (!selectedDay) return;

    const updatedDays = days.map((d) => 
      d.day === selectedDay.day ? { ...d, status: newStatus, shifts: newStatus === "off" ? "Off Duty" : "09:00 AM - 04:00 PM" } : d
    );

    setDays(updatedDays);
    setSelectedDay({ ...selectedDay, status: newStatus });
    setFeedback(`Successfully updated availability for Sept ${selectedDay.day}, 2026!`);
    
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Schedule Manager</h1>
          <p className="text-sm text-slate-500 mt-0.5">Configure your active practice hours and manage monthly shift allocations.</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
          <CalendarIcon className="text-blue-600" size={20} />
          <span className="font-bold text-slate-800 text-sm">{currentMonth}</span>
        </div>
      </div>

      {feedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm font-medium flex items-center gap-2 shadow-sm animate-fadeIn">
          <CheckCircle size={18} className="text-emerald-600 shrink-0" /> {feedback}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid View */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="text-blue-600" size={18} /> Monthly Availability Matrix
            </h2>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Available</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Booked</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Off</span>
            </div>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((item) => {
              const isSelected = selectedDay?.day === item.day;
              let statusBg = "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100";
              if (item.status === "busy") statusBg = "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100";
              if (item.status === "off") statusBg = "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100";

              return (
                <button
                  key={item.day}
                  onClick={() => setSelectedDay(item)}
                  className={`h-20 rounded-xl p-2.5 flex flex-col justify-between border transition-all cursor-pointer text-left ${statusBg} ${
                    isSelected ? "ring-2 ring-blue-600 ring-offset-2 shadow-md" : ""
                  }`}
                >
                  <span className="font-extrabold text-sm">{item.day}</span>
                  <span className="text-[10px] font-bold uppercase truncate">
                    {item.status === "available" ? "Open" : item.status === "busy" ? "Booked" : "Off"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Configuration Sidebar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between space-y-6">
          {selectedDay ? (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Selected Date</span>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">September {selectedDay.day}, 2026</h3>
                <p className="text-xs text-slate-500 mt-1">Configure active hours or toggle shift status for patients booking appointments.</p>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Current Status:</span>
                  <span className={`font-bold uppercase ${selectedDay.status === "available" ? "text-emerald-600" : selectedDay.status === "busy" ? "text-amber-600" : "text-slate-500"}`}>
                    {selectedDay.status}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Allocated Shifts:</span>
                  <span className="font-bold text-slate-800">{selectedDay.shifts}</span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Update Day Status</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleStatusChange("available")}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      selectedDay.status === "available" 
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20" 
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    Available
                  </button>
                  <button
                    onClick={() => handleStatusChange("busy")}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      selectedDay.status === "busy" 
                        ? "bg-amber-600 text-white border-amber-600 shadow-lg shadow-amber-600/20" 
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    Booked
                  </button>
                  <button
                    onClick={() => handleStatusChange("off")}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      selectedDay.status === "off" 
                        ? "bg-slate-700 text-white border-slate-700 shadow-lg shadow-slate-700/20" 
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    Off Duty
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm">
              Select a calendar date to manage availability.
            </div>
          )}

          <div className="border-t border-slate-100 pt-4 text-xs text-slate-400 flex items-center gap-2">
            <ShieldCheck size={16} className="text-blue-600" />
            <span>Changes sync instantly with MedicareAI scheduling queues.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
