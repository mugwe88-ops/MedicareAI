"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Calendar as CalendarIcon, 
  Video, 
  LayoutDashboard,
  Calendar,
  Settings as SettingsIcon,
  LogOut,
  Trash2,
  CheckCircle,
  Plus
} from "lucide-react";

interface Slot {
  id: number;
  day_of_week?: string;
  slot_date?: string;
  start_time: string;
  end_time: string;
}

export default function ScheduleManager() {
  const [doctorName, setDoctorName] = useState<string>("Dr. Ivan Weru");
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

  const API_BASE = "https://medicareai-1.onrender.com";
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token) {
      router.push("/login");
      return;
    }

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.name) setDoctorName(parsed.name);
      } catch (e) {
        console.error("Failed to parse user", e);
      }
    }

    fetchSlots(token);
  }, []);

  const fetchSlots = async (authToken?: string) => {
    const token = authToken || localStorage.getItem("token");
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

    const token = localStorage.getItem("token");
    try {
      // Build robust payload compatible with both date-specific and recurring slot endpoints
      const payload: any = {
        start_time: startTime,
        end_time: endTime,
      };

      if (mode === "specific") {
        payload.slot_date = selectedDate;
        // Derive day of week for convenience if backend expects it
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
    const token = localStorage.getItem("token");
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

  const getInitials = (name: string) => {
    return name
      .replace(/^dr\.\s*/i, "")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col justify-between hidden md:flex sticky top-0 h-screen border-r border-slate-800 z-30">
        <div>
          <div className="p-6 border-b border-slate-800/80">
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Swift MD Portal</p>
            <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">Doctor Workspace</h2>
          </div>

          <div className="p-4 space-y-1">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">Clinical Menu</p>
            
            <button 
              onClick={() => router.push("/doctors/dashboard")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 font-medium text-sm transition"
            >
              <LayoutDashboard size={18} /> Dashboard
            </button>
            <button 
              onClick={() => router.push("/doctors/dashboard/telehealth/1")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 font-medium text-sm transition"
            >
              <Video size={18} /> Telehealth Room
            </button>
            <button 
              onClick={() => {}}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-600 text-white font-medium text-sm shadow-sm transition"
            >
              <Calendar size={18} /> Schedule Manager
            </button>
            <button 
              onClick={() => router.push("/doctors/settings")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 font-medium text-sm transition"
            >
              <SettingsIcon size={18} /> Settings
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              router.push("/login");
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/30 rounded-lg transition"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-slate-900 text-white px-8 py-3.5 flex justify-between items-center sticky top-0 z-20 border-b border-slate-800 shadow-sm">
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Live Practice Environment</p>
            <p className="text-sm font-medium text-slate-200">Welcome back, {doctorName}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-bold text-white leading-tight">{doctorName}</p>
              <p className="text-[10px] font-medium text-blue-400 uppercase tracking-wider">Medical Specialist</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow">
              {getInitials(doctorName)}
            </div>
          </div>
        </header>

        <main className="max-w-7xl w-full mx-auto px-6 py-8 space-y-8 flex-1">
          {/* App Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">SWIFT MD</h1>
              <p className="text-sm text-slate-500 mt-0.5">Manage practice availability slots and monthly calendar view.</p>
            </div>
            <button
              onClick={() => router.push("/doctors/dashboard/telehealth/1")}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium text-xs shadow-sm flex items-center gap-2"
            >
              <Video size={16} /> Quick Consult Room
            </button>
          </div>

          {feedback && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm font-medium flex items-center gap-2">
              <CheckCircle size={18} /> {feedback}
            </div>
          )}

          {/* Schedule Manager Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <CalendarIcon className="text-blue-600" size={20} /> Schedule Manager
                </h2>
                <p className="text-xs text-slate-500">Configure your active practice hours visible to patients during booking.</p>
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
            <form onSubmit={handleAddSlot} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-slate-50 p-4 rounded-xl border border-slate-200/80">
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
                  className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50 shadow-sm flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> {submitting ? "Adding..." : "Add Slot"}
                </button>
              </div>
            </form>

            {/* Current Active Schedule List */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Current Active Schedule ({slots.length})
              </h3>
              
              {loading ? (
                <p className="text-xs text-slate-400 italic">Loading active schedule...</p>
              ) : slots.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-500 italic">
                  No availability slots added yet. Patients will not see open times for booking.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {slots.map((slot) => (
                    <div key={slot.id} className="p-3.5 bg-white rounded-lg border border-slate-200 shadow-sm flex items-center justify-between gap-3">
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
                        className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition"
                        title="Delete Slot"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}