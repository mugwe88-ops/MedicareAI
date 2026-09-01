"use client";

import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Clock, Plus, Trash2, RefreshCw } from "lucide-react";

interface AvailabilitySlot {
  id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
}

export default function DoctorSchedulePage() {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      // Decode or get doctor ID from token or use profile endpoint
      // Assuming we fetch current doctor profile first to get ID
      const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (profileRes.ok) {
        const profile = await profileRes.json();
        const docId = profile.id;

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/doctors/${docId}/availability`);
        if (res.ok) {
          const data = await res.json();
          setSlots(data);
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
  }, []);

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profile = await profileRes.json();

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/doctors/${profile.id}/availability`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ day_of_week: selectedDay, start_time: startTime, end_time: endTime }),
      });

      if (res.ok) {
        fetchSchedule();
      }
    } catch (err) {
      console.error("Failed to add slot:", err);
    }
  };

  const handleDeleteSlot = async (slotId: number) => {
    try {
      const token = localStorage.getItem("token");
      const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profile = await profileRes.json();

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/doctors/${profile.id}/availability/${slotId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        fetchSchedule();
      }
    } catch (err) {
      console.error("Failed to delete slot:", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div>
          <span className="text-xs uppercase tracking-wider text-blue-600 font-bold block mb-1">Practice Availability</span>
          <h1 className="text-xl font-extrabold text-gray-900">Schedule Manager</h1>
          <p className="text-xs text-gray-500 mt-1">Configure active hours, view shift allocations, and manage weekly availability.</p>
        </div>
        <button onClick={fetchSchedule} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Add Slot & List Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Add Form */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-900">Add Availability Slot</h3>
          <form onSubmit={handleAddSlot} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">Day of Week</label>
              <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)} className="w-full border border-gray-200 rounded-xl p-2.5 text-xs bg-gray-50">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Start Time</label>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full border border-gray-200 rounded-xl p-2 text-xs bg-gray-50" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">End Time</label>
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full border border-gray-200 rounded-xl p-2 text-xs bg-gray-50" />
              </div>
            </div>
            <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow">
              <Plus size={16} /> Add Slot
            </button>
          </form>
        </div>

        {/* Schedule List Table */}
        <div className="md:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-4">All Configured Schedule Slots</h3>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 uppercase">
                <th className="pb-3">Day</th>
                <th className="pb-3">Start Time</th>
                <th className="pb-3">End Time</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={4} className="py-6 text-center text-gray-400 font-bold">Loading schedule slots...</td></tr>
              ) : slots.length === 0 ? (
                <tr><td colSpan={4} className="py-6 text-center text-gray-400 font-bold">No schedule slots configured yet.</td></tr>
              ) : (
                slots.map((slot) => (
                  <tr key={slot.id} className="hover:bg-gray-50">
                    <td className="py-3 font-bold text-gray-900">{slot.day_of_week}</td>
                    <td className="py-3 text-gray-600">{slot.start_time}</td>
                    <td className="py-3 text-gray-600">{slot.end_time}</td>
                    <td className="py-3 text-right">
                      <button onClick={() => handleDeleteSlot(slot.id)} className="text-red-500 hover:text-red-700 p-1 cursor-pointer">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}