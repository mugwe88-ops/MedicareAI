"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Award, Clock, Save, CheckCircle2, RefreshCw, AlertCircle, Calendar, Check } from "lucide-react";

interface DoctorProfile {
  name: string;
  email: string;
  specialization: string;
  bio: string;
  availability: string;
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function DoctorProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<DoctorProfile>({
    name: "",
    email: "",
    specialization: "",
    bio: "",
    availability: "",
  });

  // Structured shift state parsed from availability string or defaults
  const [scheduleMap, setScheduleMap] = useState<Record<string, { active: boolean; hours: string }>>({
    Monday: { active: true, hours: "09:00 AM - 05:00 PM" },
    Tuesday: { active: true, hours: "09:00 AM - 05:00 PM" },
    Wednesday: { active: true, hours: "09:00 AM - 05:00 PM" },
    Thursday: { active: true, hours: "09:00 AM - 05:00 PM" },
    Friday: { active: true, hours: "09:00 AM - 05:00 PM" },
    Saturday: { active: false, hours: "Off Duty" },
    Sunday: { active: false, hours: "Off Duty" },
  });

  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";

  // Fetch real profile data from database on mount
  const fetchProfile = async () => {
    setInitialLoading(true);
    setErrorMsg("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMsg("Authentication token missing. Please sign in again.");
        setInitialLoading(false);
        return;
      }

      const res = await fetch(`${baseUrl}/api/doctors/profile`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setProfile({
          name: data.name || "",
          email: data.email || "",
          specialization: data.specialization || "",
          bio: data.bio || "",
          availability: data.availability || "",
        });

        // Try parsing existing availability string if it's formatted or store defaults
        if (data.availability && data.availability.includes(":")) {
          // Keep it simple or let them customize via the interactive grid
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        setErrorMsg(errData.message || "Failed to load doctor profile records.");
      }
    } catch (err) {
      console.error("Error fetching doctor profile:", err);
      setErrorMsg("Unable to connect to backend server. Verify network connection.");
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const toggleDayStatus = (day: string) => {
    setScheduleMap((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        active: !prev[day].active,
        hours: !prev[day].active ? "09:00 AM - 05:00 PM" : "Off Duty",
      },
    }));
  };

  const handleDayHoursChange = (day: string, newHours: string) => {
    setScheduleMap((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        hours: newHours,
      },
    }));
  };

  // Submit profile changes to backend
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      // Compile schedule map into a readable availability string representation for database storage
      const compiledAvailability = Object.entries(scheduleMap)
        .map(([day, val]) => `${day}: ${val.active ? val.hours : "Off Duty"}`)
        .join(" | ");

      const payload = {
        ...profile,
        availability: compiledAvailability,
      };

      const token = localStorage.getItem("token");
      const res = await fetch(`${baseUrl}/api/doctors/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccessMsg("Profile and shift availability updated successfully!");
        setProfile(payload);
      } else {
        const errData = await res.json().catch(() => ({}));
        setErrorMsg(errData.message || "Failed to update profile changes.");
      }
    } catch (err) {
      console.error("Error saving doctor profile:", err);
      setErrorMsg("Network error saving profile changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const initials = profile.name
    ? profile.name
        .replace(/^Dr\.\s+/i, "")
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "DR";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center space-x-4 border-b border-gray-100 pb-6 mb-6">
          <div className="h-16 w-16 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
            {initials}
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">Profile & Availability</h1>
            <p className="text-xs text-gray-500">Manage your public practitioner credentials and shift schedules.</p>
          </div>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl flex items-center gap-2 font-semibold">
            <CheckCircle2 size={16} /> {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 font-semibold">
            <AlertCircle size={16} /> {errorMsg}
          </div>
        )}

        {initialLoading ? (
          <div className="py-16 text-center text-xs text-gray-400 font-bold flex items-center justify-center gap-2">
            <RefreshCw size={16} className="animate-spin text-blue-600" /> Fetching practitioner profile data...
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
                  <User size={16} className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    placeholder="e.g. Dr. Jane Doe"
                    className="w-full bg-transparent text-xs text-gray-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
                  <Mail size={16} className="text-gray-400 mr-2" />
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    placeholder="doctor@example.com"
                    className="w-full bg-transparent text-xs text-gray-900 outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Specialization</label>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
                <Award size={16} className="text-gray-400 mr-2" />
                <input
                  type="text"
                  name="specialization"
                  value={profile.specialization}
                  onChange={handleChange}
                  placeholder="e.g. Cardiology"
                  className="w-full bg-transparent text-xs text-gray-900 outline-none"
                />
              </div>
            </div>

            {/* Interactive Weekly Shift Matrix (Like Schedule Manager) */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-extrabold text-gray-900 flex items-center gap-1.5">
                    <Clock size={14} className="text-blue-600" /> Weekly Practice Hours & Shift Configuration
                  </h3>
                  <p className="text-[11px] text-gray-500">Toggle days active/off and specify consultation hours for patient booking.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {DAYS_OF_WEEK.map((day) => {
                  const dayConfig = scheduleMap[day] || { active: false, hours: "Off Duty" };
                  return (
                    <div
                      key={day}
                      className={`p-3 rounded-xl border transition flex items-center justify-between gap-2 ${
                        dayConfig.active ? "bg-blue-50/40 border-blue-200" : "bg-gray-50 border-gray-200 opacity-75"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => toggleDayStatus(day)}
                          className={`w-12 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${
                            dayConfig.active ? "bg-emerald-500 justify-end" : "bg-gray-300 justify-start"
                          }`}
                        >
                          <span className="w-4 h-4 bg-white rounded-full shadow-md"></span>
                        </button>
                        <div>
                          <span className="text-xs font-bold text-gray-900 block">{day}</span>
                          <span
                            className={`text-[10px] font-bold ${
                              dayConfig.active ? "text-emerald-600" : "text-gray-400"
                            }`}
                          >
                            {dayConfig.active ? "Open Shift" : "Off Duty"}
                          </span>
                        </div>
                      </div>

                      {dayConfig.active && (
                        <input
                          type="text"
                          value={dayConfig.hours}
                          onChange={(e) => handleDayHoursChange(day, e.target.value)}
                          placeholder="09:00 AM - 05:00 PM"
                          className="w-36 bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-[11px] text-gray-800 outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">Professional Bio</label>
              <textarea
                name="bio"
                rows={4}
                value={profile.bio}
                onChange={handleChange}
                placeholder="Describe your qualifications and experience..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save size={16} /> {saving ? "Saving Schedule..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}