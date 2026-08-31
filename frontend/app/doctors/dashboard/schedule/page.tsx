"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Calendar as CalendarIcon, 
  Trash2,
  CheckCircle,
  Plus,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface Slot {
  id: number;
  day_of_week?: string;
  slot_date?: string;
  start_time: string;
  end_time: string;
}

export default function ScheduleManager() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
   
  // Schedule creation form state
  const [mode, setMode] = useState<"specific" | "recurring">("specific");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [recurringDay, setRecurringDay] = useState<string>("Monday");
  const [startTime, setStartTime] = useState<string>("09:00 AM");
  const [endTime, setEndTime] = useState<string>("05:00 PM");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Calendar month view state
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const API_BASE = "https://medicareai-1.onrender.com";
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("jwt");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchSlots(token);
  }, [router]);

  const fetchSlots = async (authToken?: string | null) => {
    const token = authToken || localStorage.getItem("token") || localStorage.getItem("jwt");
    try {
      const res = await fetch(`${API_BASE}/api/doctor/availability`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setSlots(data);
      }
    } catch (err) {
      console.error("Error fetching slots:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    const token = localStorage.getItem("token") || localStorage.getItem("jwt");
    try {
      const payload: any = {
        start_time: startTime,
        end_time: endTime,
      };

      if (mode === "specific") {
        payload.slot_date = selectedDate;
        const d = new Date(selectedDate);
        payload.day_of_week = !isNaN(d.getTime())
          ? d.toLocaleDateString("en-US", { weekday: "long" })
          : "Monday";
      } else {
        payload.day_of_week = recurringDay;
      }

      const res = await fetch(`${API_BASE}/api/doctor/availability`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to add availability slot.");
      }

      setFeedback("Availability slot added successfully!");
      fetchSlots(token);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback(err.message || "Error creating slot.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSlot = async (id: number) => {
    const token = localStorage.getItem("token") || localStorage.getItem("jwt");
    try {
      const res = await fetch(`${API_BASE}/api/doctor/availability/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setSlots((prev) => prev.filter((s) => s.id !== id));
      } else {
        alert("Failed to delete slot.");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // Calendar Helpers
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayIndex = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Schedule Manager</h1>
        <p className="text-sm text-slate-500 mt-0.5">Configure your active practice hours and view your monthly practice calendar.</p>
      </div>

      {feedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm font-medium flex items-center gap-2">
          <CheckCircle size={18} /> {feedback}
        </div>
      )}

      {/* Main Grid: Calendar view on left/top, Manager configuration on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Calendar Widget */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <div className="flex items-center gap-1">
              <button onClick={prevMonth} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition">
                <ChevronLeft size={16} />
              </button>
              <button onClick={nextMonth} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 text-center text-[11px] font-bold text-slate-400 uppercase">
            <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const formattedDate = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const hasSlots = slots.some(s => s.slot_date === formattedDate);
              const isSelected = selectedDate === formattedDate;

              return (
                <button
                  key={dayNum}
                  onClick={() => {
                    setSelectedDate(formattedDate);
                    setMode("specific");
                  }}
                  className={`h-9 rounded-xl flex flex-col items-center justify-center font-medium transition relative ${
                    isSelected 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : hasSlots 
                      ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200' 
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span>{dayNum}</span>
                  {hasSlots && !isSelected && (
                    <span className="w-1 h-1 bg-blue-600 rounded-full mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Configuration & Slot Manager Form */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 lg:col-span-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CalendarIcon className="text-blue-600" size={18} /> Configure Availability Slots
              </h2>
              <p className="text-xs text-slate-500">Add slots for specific dates or repeating weekly routines.</p>
            </div>

            {/* Mode switch */}
            <div className="bg-slate-100 p-1 rounded-lg flex items-center gap-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setMode("specific")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                  mode === "specific" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Specific Date
              </button>
              <button
                type="button"
                onClick={() => setMode("recurring")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                  mode === "recurring" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Recurring Day
              </button>
            </div>
          </div>

          {/* Add Slot Form */}
          <form onSubmit={handleAddSlot} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            {mode === "specific" ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Selected Date</label>
                <input
                  type="date"
                  required
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Day of Week</label>
                <select
                  value={recurringDay}
                  onChange={(e) => setRecurringDay(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
                >
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
              <input
                type="text"
                required
                placeholder="09:00 AM"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
              <input
                type="text"
                required
                placeholder="05:00 PM"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus size={16} /> {submitting ? "Adding..." : "Add Slot"}
              </button>
            </div>
          </form>

        </div>
      </div>

      {/* Current Active Schedule List Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Current Active Schedule ({slots.length})
        </h3>
        
        {loading ? (
          <p className="text-xs text-slate-400 italic">Loading active schedule...</p>
        ) : slots.length === 0 ? (
          <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 italic text-center">
            No availability slots added yet. Patients will not see open times for booking.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {slots.map((slot) => (
              <div key={slot.id} className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900 text-xs">
                    {slot.slot_date ? `Date: ${slot.slot_date}` : slot.day_of_week || "Recurring"}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {slot.start_time} - {slot.end_time}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteSlot(slot.id)}
                  className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition cursor-pointer"
                  title="Delete Slot"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
