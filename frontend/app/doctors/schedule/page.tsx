"use client";

import { useState, useEffect } from "react";
import { RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";

interface ScheduleDay {
  date: string; // YYYY-MM-DD
  dayNumber: number;
  status: "OPEN" | "BOOKED" | "OFF";
}

export default function DoctorSchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 1)); // September 2026
  const [selectedDate, setSelectedDate] = useState<string>("2026-09-01");
  const [monthSchedule, setMonthSchedule] = useState<Record<string, "OPEN" | "BOOKED" | "OFF">>({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (profileRes.ok) {
        const profile = await profileRes.json();
        const docId = profile.id;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/doctors/${docId}/schedule-month?year=${year}&month=${month + 1}`);
        
        if (res.ok) {
          const data = await res.json();
          // Map array of { date, status } into an object lookup key
          const scheduleMap: Record<string, "OPEN" | "BOOKED" | "OFF"> = {};
          data.forEach((item: { date: string; status: "OPEN" | "BOOKED" | "OFF" }) => {
            scheduleMap[item.date] = item.status;
          });
          setMonthSchedule(scheduleMap);
        }
      }
    } catch (err) {
      console.error("Failed to load schedule:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [currentDate]);

  const updateStatus = async (newStatus: "OPEN" | "BOOKED" | "OFF") => {
    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profile = await profileRes.json();

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/doctors/${profile.id}/schedule-override`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ date: selectedDate, status: newStatus }),
      });

      if (res.ok) {
        setMonthSchedule((prev) => ({ ...prev, [selectedDate]: newStatus }));
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdating(false);
    }
  };

  // Helper to construct grid days
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const daysArray: (ScheduleDay | null)[] = Array.from({ length: firstDayIndex }, () => null);
  for (let d = 1; d <= daysInMonth; d++) {
    const formattedDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    daysArray.push({
      date: formattedDate,
      dayNumber: d,
      status: monthSchedule[formattedDate] || "OFF",
    });
  }

  const selectedStatus = monthSchedule[selectedDate] || "OFF";

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div>
          <span className="text-xs uppercase tracking-wider text-blue-600 font-bold block mb-1">Practice Availability</span>
          <h1 className="text-xl font-extrabold text-gray-900">Schedule Manager</h1>
          <p className="text-xs text-gray-500 mt-1">Configure active hours and manage monthly shift allocations instantly.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-700">
            <span>{currentDate.toLocaleString("default", { month: "long", year: "numeric" })}</span>
          </div>
          <button onClick={fetchSchedule} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Monthly Availability Matrix */}
        <div className="md:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-900">Monthly Availability Matrix</h3>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Available</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Booked</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-gray-300"></span> Off</span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider py-2">
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {daysArray.map((dayObj, i) => {
              if (!dayObj) return <div key={`empty-${i}`} className="h-20 rounded-xl bg-gray-50/50"></div>;

              const isSelected = selectedDate === dayObj.date;
              const status = dayObj.status;

              let style = "bg-gray-50 border-gray-200 text-gray-400";
              let badgeStyle = "bg-gray-200 text-gray-600";
              
              if (status === "OPEN") {
                style = "bg-emerald-50/40 border-emerald-200 text-emerald-900";
                badgeStyle = "bg-emerald-100 text-emerald-700 font-bold";
              } else if (status === "BOOKED") {
                style = "bg-amber-50/40 border-amber-200 text-amber-900";
                badgeStyle = "bg-amber-100 text-amber-700 font-bold";
              }

              return (
                <button
                  key={dayObj.date}
                  onClick={() => setSelectedDate(dayObj.date)}
                  className={`h-20 border rounded-xl p-2 text-left flex flex-col justify-between transition-all cursor-pointer ${style} ${isSelected ? "ring-2 ring-blue-600 border-transparent shadow-sm" : ""}`}
                >
                  <span className="text-xs font-bold">{dayObj.dayNumber}</span>
                  <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded-md text-center block ${badgeStyle}`}>
                    {status === "OPEN" ? "OPEN" : status === "BOOKED" ? "BOOKED" : "OFF"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Controls */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Selected Date</span>
            <h3 className="text-lg font-extrabold text-gray-900">
              {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </h3>
            <p className="text-xs text-gray-500 mt-1">Configure active hours or toggle shift status for patient bookings.</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Current Status:</span>
              <span className="font-bold text-gray-900">{selectedStatus}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 block">Update Day Status</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                disabled={updating}
                onClick={() => updateStatus("OPEN")}
                className={`py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${selectedStatus === "OPEN" ? "bg-emerald-600 text-white border-emerald-600 shadow" : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"}`}
              >
                Available
              </button>
              <button
                disabled={updating}
                onClick={() => updateStatus("BOOKED")}
                className={`py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${selectedStatus === "BOOKED" ? "bg-amber-500 text-white border-amber-500 shadow" : "border-amber-200 text-amber-700 hover:bg-amber-50"}`}
              >
                Booked
              </button>
              <button
                disabled={updating}
                onClick={() => updateStatus("OFF")}
                className={`py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${selectedStatus === "OFF" ? "bg-gray-900 text-white border-gray-900 shadow" : "border-gray-200 text-gray-700 hover:bg-gray-100"}`}
              >
                Off Duty
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}