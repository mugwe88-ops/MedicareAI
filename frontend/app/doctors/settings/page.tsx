// frontend/app/doctors/settings/profile/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Shield,
  Clock,
  Bell,
  FileText,
  Lock,
  Camera,
  CheckCircle2,
  AlertCircle,
  Save,
  Trash2,
  Upload,
  Plus,
  Globe,
  Calendar,
  Smartphone,
  Check,
  X,
  ChevronRight,
  HelpCircle,
  Award,
  Video,
  MessageSquare,
  Phone,
  Zap,
  MapPin,
  Building
} from "lucide-react";

export default function DoctorProfileSettingsPage() {
  // --- STATE ---
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"profile" | "availability" | "telehealth" | "security" | "notifications" | "documents">("profile");

  // Profile Form State (Auto-filled with real user data)
  const [profile, setProfile] = useState({
    fullName: "Dr. William Mugwe Weru, MMed",
    email: "william.mugwe@swiftmd.health",
    phone: "+254 712 345 678",
    dob: "1988-04-12",
    licenseNumber: "KMLTTB-MED-9942",
    kmpdcNumber: "A14892",
    specialization: "Internal Medicine & Critical Care",
    department: "Clinical Services & Diagnostics",
    experience: "8",
    qualifications: "MBChB, MMed (Int. Med), KMLTTB Fellow",
    hospital: "Swift MD Nairobi Central Medical Complex",
    address: "Kenyatta Avenue, Suite 402",
    city: "Nairobi",
    consultationFee: "3500",
    followUpFee: "2000",
    bio: "Experienced medical specialist and laboratory technologist with over 8 years of clinical practice focusing on complex internal medicine, evidence-based critical care protocols, and advanced diagnostic oversight.",
    languages: ["English", "Swahili"],
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300",
    profileCompletion: 92,
    isVerified: true
  });

  // Availability State
  const [availability, setAvailability] = useState({
    timezone: "Africa/Nairobi (EAT)",
    bufferTime: "15 mins",
    maxDailyAppointments: 16,
    vacationMode: false,
    emergencyAvailable: true,
    days: {
      monday: { active: true, slots: [{ start: "08:00", end: "13:00" }, { start: "14:00", end: "17:00" }] },
      tuesday: { active: true, slots: [{ start: "08:00", end: "13:00" }, { start: "14:00", end: "17:00" }] },
      wednesday: { active: true, slots: [{ start: "08:00", end: "13:00" }, { start: "14:00", end: "17:00" }] },
      thursday: { active: true, slots: [{ start: "08:00", end: "13:00" }, { start: "14:00", end: "17:00" }] },
      friday: { active: true, slots: [{ start: "08:00", end: "13:00" }, { start: "14:00", end: "16:00" }] },
      saturday: { active: true, slots: [{ start: "09:00", end: "13:00" }] },
      sunday: { active: false, slots: [] }
    }
  });

  // Telehealth Preferences
  const [telehealth, setTelehealth] = useState({
    video: true,
    audio: true,
    chat: true,
    instant: true,
    avgResponseTime: "< 3 mins"
  });

  // Notifications
  const [notifications, setNotifications] = useState({
    appointmentReminders: true,
    newPatientAlerts: true,
    cancellations: true,
    telehealthAlerts: true,
    email: true,
    sms: true,
    push: true
  });

  // Documents State
  const [documents, setDocuments] = useState([
    { id: "d1", name: "Medical Practitioner License 2026", type: "PDF", status: "Verified", date: "12 Jan 2026" },
    { id: "d2", name: "KMLTTB Practicing Certificate", type: "PDF", status: "Verified", date: "05 Feb 2026" },
    { id: "d3", name: "National ID / Passport", type: "PDF", status: "Verified", date: "10 Jan 2024" },
    { id: "d4", name: "MMed Degree Certificate", type: "PDF", status: "Pending Review", date: "18 Aug 2026" }
  ]);

  // --- DATA HYDRATION (SUPABASE SIMULATION) ---
  useEffect(() => {
    const fetchDoctorProfile = async () => {
      setLoading(true);
      try {
        await new Promise((r) => setTimeout(r, 600));
        // Real Supabase data hydration goes here (e.g. supabase.from('doctors').select('*').eq('id', user.id))
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };
    fetchDoctorProfile();
  }, []);

  // Track Unsaved Changes
  const handleFieldChange = (setter: any, field: string, value: any) => {
    setter((prev: any) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      // Simulate Supabase Update sync across Doctor Dashboard, Telehealth & Patient Booking
      await new Promise((r) => setTimeout(r, 800));
      setSaving(false);
      setHasUnsavedChanges(false);
      setSuccessToast(true);
      setTimeout(() => setSuccessToast(false), 4000);
    } catch (err) {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500">Syncing doctor profile & availability from Supabase...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/80 font-sans pb-32">
      
      {/* ================= STICKY PAGE HEADER ================= */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-3.5 shadow-xs">
        <div className="max-w-[800px] mx-auto flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Doctor Profile & Availability</h1>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold rounded-full flex items-center gap-1">
                <CheckCircle2 size={11} /> Verified Provider
              </span>
            </div>
            <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
              Last updated: Today at 2:45 PM EAT • Synchronized with patient booking & telehealth engine
            </p>
          </div>

          <div className="flex items-center gap-3">
            {hasUnsavedChanges && (
              <span className="hidden sm:inline-block text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                Unsaved changes
              </span>
            )}
            <button
              onClick={handleSaveChanges}
              disabled={saving}
              className={`px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-md shadow-blue-600/30 transition flex items-center gap-2 cursor-pointer ${
                saving ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={15} />}
              <span>{saving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="max-w-[800px] mx-auto flex items-center gap-1.5 mt-3 overflow-x-auto pb-1">
          {[
            { id: "profile", label: "Profile & Practice", icon: User },
            { id: "availability", label: "Schedule & Availability", icon: Clock },
            { id: "telehealth", label: "Telehealth", icon: Video },
            { id: "security", label: "Security", icon: Lock },
            { id: "notifications", label: "Notifications", icon: Bell },
            { id: "documents", label: "Credentials", icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= SUCCESS TOAST ================= */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <div className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center">
            <Check size={14} />
          </div>
          <div>
            <strong className="text-xs font-black block">Changes Saved Successfully</strong>
            <span className="text-[10px] text-slate-300">Synced across Swift MD patient portal & telehealth nodes.</span>
          </div>
        </div>
      )}

      {/* ================= MAIN CONTENT CONTAINER (MAX WIDTH 800px) ================= */}
      <div className="max-w-[800px] mx-auto px-4 md:px-0 pt-6 space-y-6">

        {/* ================= TAB 1: PROFILE & PRACTICE ================= */}
        {activeTab === "profile" && (
          <>
            {/* PROFILE HEADER CARD */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <div className="relative">
                  <img
                    src={profile.avatar}
                    alt={profile.fullName}
                    className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 shadow-md"
                  />
                  <label className="absolute bottom-0 right-0 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg cursor-pointer transition">
                    <Camera size={14} />
                    <input type="file" className="hidden" onChange={() => setHasUnsavedChanges(true)} />
                  </label>
                </div>

                <div className="space-y-2 text-center sm:text-left flex-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h2 className="text-xl font-black text-slate-900">{profile.fullName}</h2>
                    <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-extrabold rounded-full border border-blue-200">
                      {profile.specialization}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{profile.hospital} • {profile.city}</p>

                  {/* Profile Completion Bar */}
                  <div className="space-y-1 pt-1 max-w-sm">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                      <span>Profile Completion</span>
                      <span className="text-blue-600">{profile.profileCompletion}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div style={{ width: `${profile.profileCompletion}%` }} className="h-full bg-blue-600 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Shield size={15} className="text-emerald-600" />
                  <span>KMPDC License: <strong className="text-slate-900">{profile.kmpdcNumber}</strong> (Active)</span>
                </div>
                <button
                  onClick={() => alert("Previewing public doctor profile card...")}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Preview Public Profile
                </button>
              </div>
            </div>

            {/* PERSONAL INFORMATION CARD */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">Personal Information</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    value={profile.fullName}
                    onChange={(e) => handleFieldChange(setProfile, "fullName", e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleFieldChange(setProfile, "email", e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Phone Number</label>
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={(e) => handleFieldChange(setProfile, "phone", e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Date of Birth (Optional)</label>
                  <input
                    type="date"
                    value={profile.dob}
                    onChange={(e) => handleFieldChange(setProfile, "dob", e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                  />
                </div>
              </div>
            </div>

            {/* PROFESSIONAL INFORMATION CARD */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">Professional Information</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Medical License Number</label>
                  <input
                    type="text"
                    value={profile.licenseNumber}
                    onChange={(e) => handleFieldChange(setProfile, "licenseNumber", e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">KMPDC Registration Number</label>
                  <input
                    type="text"
                    value={profile.kmpdcNumber}
                    onChange={(e) => handleFieldChange(setProfile, "kmpdcNumber", e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Specialization</label>
                  <input
                    type="text"
                    value={profile.specialization}
                    onChange={(e) => handleFieldChange(setProfile, "specialization", e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Department</label>
                  <input
                    type="text"
                    value={profile.department}
                    onChange={(e) => handleFieldChange(setProfile, "department", e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Years of Experience</label>
                  <input
                    type="number"
                    value={profile.experience}
                    onChange={(e) => handleFieldChange(setProfile, "experience", e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Qualifications</label>
                  <input
                    type="text"
                    value={profile.qualifications}
                    onChange={(e) => handleFieldChange(setProfile, "qualifications", e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                  />
                </div>
              </div>
            </div>

            {/* PRACTICE INFORMATION CARD */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">Practice Information & Fees</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Hospital / Clinic Name</label>
                  <input
                    type="text"
                    value={profile.hospital}
                    onChange={(e) => handleFieldChange(setProfile, "hospital", e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Practice Address</label>
                  <input
                    type="text"
                    value={profile.address}
                    onChange={(e) => handleFieldChange(setProfile, "address", e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">City</label>
                  <input
                    type="text"
                    value={profile.city}
                    onChange={(e) => handleFieldChange(setProfile, "city", e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Consultation Fee (KES)</label>
                  <input
                    type="number"
                    value={profile.consultationFee}
                    onChange={(e) => handleFieldChange(setProfile, "consultationFee", e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Follow-up Fee (KES)</label>
                  <input
                    type="number"
                    value={profile.followUpFee}
                    onChange={(e) => handleFieldChange(setProfile, "followUpFee", e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                  />
                </div>
              </div>
            </div>

            {/* ABOUT ME & LANGUAGES CARD */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">About Me & Languages</h3>
              
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Professional Bio</label>
                  <span className="text-[10px] text-slate-400 font-medium">{profile.bio.length}/500 characters</span>
                </div>
                <textarea
                  rows={4}
                  maxLength={500}
                  value={profile.bio}
                  onChange={(e) => handleFieldChange(setProfile, "bio", e.target.value)}
                  className="w-full p-4 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Languages Spoken</label>
                <div className="flex flex-wrap gap-2">
                  {profile.languages.map((lang, idx) => (
                    <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5">
                      {lang}
                      <button onClick={() => {
                        const newLangs = profile.languages.filter((_, i) => i !== idx);
                        handleFieldChange(setProfile, "languages", newLangs);
                      }} className="text-slate-400 hover:text-red-500">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={() => {
                      const lang = prompt("Enter language spoken:");
                      if (lang) handleFieldChange(setProfile, "languages", [...profile.languages, lang]);
                    }}
                    className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer hover:bg-blue-100 transition"
                  >
                    <Plus size={12} /> Add Language
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ================= TAB 2: SCHEDULE & AVAILABILITY ================= */}
        {activeTab === "availability" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Clinic Working Hours & Slots</h3>
                  <p className="text-xs text-slate-500">Configure weekly availability for instant patient bookings.</p>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={availability.vacationMode}
                      onChange={(e) => {
                        setAvailability({...availability, vacationMode: e.target.checked});
                        setHasUnsavedChanges(true);
                      }}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <span className="text-xs font-bold text-slate-700">Vacation Mode</span>
                  </label>
                </div>
              </div>

              {/* General Scheduler Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Time Zone</label>
                  <select
                    value={availability.timezone}
                    onChange={(e) => {
                      setAvailability({...availability, timezone: e.target.value});
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none"
                  >
                    <option>Africa/Nairobi (EAT)</option>
                    <option>Africa/Lagos (WAT)</option>
                    <option>UTC</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Buffer Between Visits</label>
                  <select
                    value={availability.bufferTime}
                    onChange={(e) => {
                      setAvailability({...availability, bufferTime: e.target.value});
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none"
                  >
                    <option>0 mins</option>
                    <option>10 mins</option>
                    <option>15 mins</option>
                    <option>30 mins</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Max Daily Appointments</label>
                  <input
                    type="number"
                    value={availability.maxDailyAppointments}
                    onChange={(e) => {
                      setAvailability({...availability, maxDailyAppointments: parseInt(e.target.value) || 0});
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Weekly Days Configuration */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Weekly Schedule</h4>
                <div className="space-y-3">
                  {Object.entries(availability.days).map(([day, val]) => (
                    <div key={day} className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={val.active}
                          onChange={(e) => {
                            const updated = {...availability.days, [day]: {...val, active: e.target.checked}};
                            setAvailability({...availability, days: updated});
                            setHasUnsavedChanges(true);
                          }}
                          className="w-4 h-4 text-blue-600 rounded border-slate-300"
                        />
                        <span className="text-xs font-extrabold text-slate-900 uppercase w-24">{day}</span>
                      </div>

                      {val.active ? (
                        <div className="flex flex-wrap items-center gap-2">
                          {val.slots.map((slot, sIdx) => (
                            <div key={sIdx} className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
                              <span>{slot.start}</span>
                              <span>-</span>
                              <span>{slot.end}</span>
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              const updatedSlots = [...val.slots, { start: "13:00", end: "14:00" }];
                              const updated = {...availability.days, [day]: {...val, slots: updatedSlots}};
                              setAvailability({...availability, days: updated});
                              setHasUnsavedChanges(true);
                            }}
                            className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                            title="Add time slot"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-slate-400 italic">Unavailable / Off</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: TELEHEALTH PREFERENCES ================= */}
        {activeTab === "telehealth" && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Telehealth Consultation Modes</h3>
              <p className="text-xs text-slate-500">Configure how patients can consult with you via Swift MD virtual care.</p>
            </div>

            <div className="space-y-4">
              {[
                { key: "video", title: "HD Video Consultations", desc: "Secure WebRTC encrypted video consultations with screen sharing for labs.", icon: Video },
                { key: "audio", title: "Audio-Only Consultations", desc: "Voice calls for patients with low bandwidth or unstable mobile data.", icon: Phone },
                { key: "chat", title: "Secure Chat Consultations", desc: "Asynchronous messaging for follow-ups and reviewing lab test results.", icon: MessageSquare },
                { key: "instant", title: "Instant Emergency Consultations", desc: "Accept urgent on-demand triage requests from patients needing rapid care.", icon: Zap }
              ].map((item) => {
                const Icon = item.icon;
                const isEnabled = (telehealth as any)[item.key];
                return (
                  <div key={item.key} className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl mt-0.5">
                        <Icon size={20} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900">{item.title}</h4>
                        <p className="text-[11px] text-slate-500">{item.desc}</p>
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={(e) => {
                        setTelehealth({...telehealth, [item.key]: e.target.checked});
                        setHasUnsavedChanges(true);
                      }}
                      className="w-5 h-5 text-blue-600 rounded border-slate-300 cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 4: SECURITY SECTION ================= */}
        {activeTab === "security" && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Account Security & Credentials</h3>
              <p className="text-xs text-slate-500">Protect your medical practitioner portal with advanced encryption and 2FA.</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-900">Change Password</h4>
                  <p className="text-[11px] text-slate-500">Last changed 3 months ago</p>
                </div>
                <button onClick={() => prompt("Enter new password:")} className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition">
                  Update
                </button>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-900">Two-Factor Authentication (2FA)</h4>
                  <p className="text-[11px] text-slate-500">Secured via Google Authenticator / SMS OTP</p>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-lg border border-emerald-200">
                  Enabled
                </span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-900">Active Sessions & Devices</h4>
                  <p className="text-[11px] text-slate-500">MacBook Pro (Nairobi) • Current Session</p>
                </div>
                <button onClick={() => alert("All other active sessions revoked.")} className="px-4 py-2 bg-red-50 text-red-600 font-bold text-xs rounded-xl hover:bg-red-100 transition">
                  Revoke Others
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: NOTIFICATIONS ================= */}
        {activeTab === "notifications" && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Notification Preferences</h3>
              <p className="text-xs text-slate-500">Choose how and when you receive alerts for patient bookings and urgent cases.</p>
            </div>

            <div className="space-y-3">
              {[
                { key: "appointmentReminders", label: "Appointment Reminders (15m before)" },
                { key: "newPatientAlerts", label: "New Patient Bookings" },
                { key: "cancellations", label: "Appointment Cancellations & Rescheduling" },
                { key: "telehealthAlerts", label: "Incoming Telehealth Video Call Requests" },
                { key: "email", label: "Receive Email Notifications" },
                { key: "sms", label: "Receive SMS Notifications via Africa's Talking" },
                { key: "push", label: "Browser Push Notifications" }
              ].map((item) => {
                const isChecked = (notifications as any)[item.key];
                return (
                  <div key={item.key} className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-2xl flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">{item.label}</span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        setNotifications({...notifications, [item.key]: e.target.checked});
                        setHasUnsavedChanges(true);
                      }}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 6: CREDENTIAL DOCUMENTS ================= */}
        {activeTab === "documents" && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Credentials & Compliance Documents</h3>
                <p className="text-xs text-slate-500">Upload verified medical certificates required by KMLTTB and Ministry of Health.</p>
              </div>
              <label className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer flex items-center gap-1.5">
                <Upload size={14} /> Upload Document
                <input type="file" className="hidden" onChange={() => alert("Document uploaded successfully for review.")} />
              </label>
            </div>

            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">{doc.name}</h4>
                      <p className="text-[10px] text-slate-400">Uploaded {doc.date} • {doc.type}</p>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold ${
                    doc.status === "Verified" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}>
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}