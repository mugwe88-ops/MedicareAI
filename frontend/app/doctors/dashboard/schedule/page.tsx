"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, Clock, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

interface DaySchedule {
  day: number;
  status: "OPEN" | "BOOKED" | "OFF";
  shifts: string;
}

const initialMonthData: Record<number, DaySchedule> = {
  1: { day: 1, status: "OFF", shifts: "Off Duty" },
  2: { day: 2, status: "OPEN", shifts: "09:00 AM - 05:00 PM" },
  3: { day: 3, status: "OPEN", shifts: "09:00 AM - 05:00 PM" },
  4: { day: 4, status: "BOOKED", shifts: "10:00 AM - 02:00 PM (Patient Confirmed)" },
  5: { day: 5, status: "OPEN", shifts: "09:00 AM - 05:00 PM" },
  6: { day: 6, status: "OPEN", shifts: "09:00 AM - 01:00 PM" },
  7: { day: 7, status: "BOOKED", shifts: "11:00 AM - 03:00 PM (Patient Confirmed)" },
  8: { day: 8, status: "OFF", shifts: "Off Duty" },
  9: { day: 9, status: "OPEN", shifts: "09:00 AM - 05:00 PM" },
  10: { day: 10, status: "BOOKED", shifts: "09:00 AM - 12:00 PM (Patient Confirmed)" },
  11: { day: 11, status: "OPEN", shifts: "09:00 AM - 05:00 PM" },
  12: { day: 12, status: "OPEN", shifts: "09:00 AM - 05:00 PM" },
  13: { day: 13, status: "BOOKED", shifts: "01:00 PM - 05:00 PM (Patient Confirmed)" },
  14: { day: 14, status: "OPEN", shifts: "09:00 AM - 03:00 PM" },
  15: { day: 15, status: "OFF", shifts: "Off Duty" },
  16: { day: 16, status: "BOOKED", shifts: "10:00 AM - 02:00 PM (Patient Confirmed)" },
  17: { day: 17, status: "OPEN", shifts: "09:00 AM - 05:00 PM" },
  18: { day: 18, status: "OPEN", shifts: "09:00 AM - 05:00 PM" },
  19: { day: 19, status: "BOOKED", shifts: "09:00 AM - 01:00 PM (Patient Confirmed)" },
  20: { day: 20, status: "OPEN", shifts: "09:00 AM - 05:00 PM" },
  21: { day: 21, status: "OPEN", shifts: "09:00 AM - 02:00 PM" },
  22: { day: 22, status: "OFF", shifts: "Off Duty" },
  23: { day: 23, status: "OPEN", shifts: "09:00 AM - 05:00 PM" },
  24: { day: 24, status: "OPEN", shifts: "09:00 AM - 05:00 PM" },
  25: { day: 25, status: "BOOKED", shifts: "11:00 AM - 04:00 PM (Patient Confirmed)" },
  26: { day: 26, status: "OPEN", shifts: "09:00 AM - 05:00 PM" },
  27: { day: 27, status: "OPEN", shifts: "09:00 AM - 01:00 PM" },
  28: { day: 28, status: "BOOKED", shifts: "10:00 AM - 02:00 PM (Patient Confirmed)" },
  29: { day: 29, status: "OFF", shifts: "Off Duty" },
  30: { day: 30, status: "OPEN", shifts: "09:00 AM - 05:00 PM" },
};

export default function DoctorSchedulePage() {
  const [scheduleData, setScheduleData] = useState<Record<number, DaySchedule>>(initialMonthData);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [successMsg, setSuccessMsg] = useState("");

  const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const daysArray = Array.from({ length: 30 }, (_, i) => i + 1);

  const handleStatusChange = (newStatus: "OPEN" | "BOOKED" | "OFF") => {
    const defaultShift = newStatus === "OPEN" ? "09:00 AM - 05:00 PM" : newStatus === "BOOKED" ? "Scheduled Patient Session" : "Off Duty";
    setScheduleData({
      ...scheduleData,
      [selectedDay]: { day: selectedDay, status: newStatus, shifts: defaultShift }
    });
    setSuccessMsg(`Successfully updated September ${selectedDay}, 2026 to ${newStatus}`);
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  const currentSelection = scheduleData[selectedDay] || { status: "OFF", shifts: "Off Duty" };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div>
          <span className="text-xs uppercase tracking-wider text-blue-600 font-bold block mb-1">Practice Availability</span>
          <h1 className="text-xl font-extrabold text-gray-900">Schedule Manager</h1>
          <p className="text-xs text-gray-500 mt-1">Configure your active practice hours and manage monthly shift allocations instantly.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700">
            <CalendarIcon size={16} className="text-blue-600" /> September 2026
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl flex items-center gap-2 shadow-sm">
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      {/* Main Grid Layout: Calendar Matrix (Left) + Sidebar Control Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Availability Matrix */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Clock size={16} className="text-blue-600" /> Monthly Availability Matrix
            </h3>
            
            {/* Status Legend */}
            <div className="flex items-center gap-4 text-[11px] font-semibold text-gray-600 mt-2 sm:mt-0">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span> Available</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span> Booked</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-gray-300"></span> Off</span>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-center">
            {weekDays.map(wd => (
              <span key={wd} className="text-[11px] font-extrabold text-gray-400">{wd}</span>
            ))}
          </div>

          {/* Calendar Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty slots for Sunday start offset if needed, daysArray starts at 1 */}
            {daysArray.map((dayNum) => {
              const data = scheduleData[dayNum] || { status: "OFF" };
              const isSelected = selectedDay === dayNum;

              let bgStyle = "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100";
              if (data.status === "OPEN") {
                bgStyle = "bg-emerald-50/70 border-emerald-200 text-emerald-900 hover:bg-emerald-100/80";
              } else if (data.status === "BOOKED") {
                bgStyle = "bg-amber-50/70 border-amber-200 text-amber-900 hover:bg-amber-100/80";
              }

              return (
                <button
                  key={dayNum}
                  onClick={() => setSelectedDay(dayNum)}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between h-20 sm:h-24 relative ${bgStyle} ${
                    isSelected ? "ring-2 ring-blue-600 shadow-md" : ""
                  }`}
                >
                  <span className="text-xs font-bold">{dayNum}</span>
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md w-fit ${
                    data.status === "OPEN" ? "bg-emerald-200/60 text-emerald-800" :
                    data.status === "BOOKED" ? "bg-amber-200/60 text-amber-800" : "bg-gray-200 text-gray-600"
                  }`}>
                    {data.status}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Control Panel */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="border-b border-gray-100 pb-4 mb-4">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Selected Date</span>
              <h3 className="text-lg font-extrabold text-gray-900 mt-0.5">
                September {selectedDay}, 2026
              </h3>
              <p className="text-xs text-gray-500 mt-1">Configure active hours or toggle shift status for patient bookings.</p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Current Status:</span>
                  <span className="font-extrabold text-gray-900">{currentSelection.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Allocated Shifts:</span>
                  <span className="font-bold text-blue-600 text-right">{currentSelection.shifts}</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-2">Update Day Status</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleStatusChange("OPEN")}
                    className={`py-2.5 px-2 rounded-xl font-bold text-xs transition cursor-pointer border ${
                      currentSelection.status === "OPEN"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                    }`}
                  >
                    Available
                  </button>
                  <button
                    onClick={() => handleStatusChange("BOOKED")}
                    className={`py-2.5 px-2 rounded-xl font-bold text-xs transition cursor-pointer border ${
                      currentSelection.status === "BOOKED"
                        ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                        : "bg-white text-amber-700 border-amber-200 hover:bg-amber-50"
                    }`}
                  >
                    Booked
                  </button>
                  <button
                    onClick={() => handleStatusChange("OFF")}
                    className={`py-2.5 px-2 rounded-xl font-bold text-xs transition cursor-pointer border ${
                      currentSelection.status === "OFF"
                        ? "bg-gray-800 text-white border-gray-800 shadow-sm"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    Off Duty
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 mt-6">
            <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
              <Sparkles size={14} className="text-blue-600 shrink-0" /> Changes sync instantly with MedicareAI scheduling queues.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}