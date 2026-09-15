// frontend/app/doctors/profile/edit/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  User,
  ArrowLeft,
  ShieldCheck,
  Save,
  Camera,
  Mail,
  Phone,
  MapPin,
  Building,
  Clock,
  DollarSign,
  FileText,
  Bell,
  Lock,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Eye,
  Globe,
  Award,
  Briefcase
} from "lucide-react";

export default function DoctorProfileEditPage() {
  // Profile Form State
  const [formData, setFormData] = useState({
    firstName: "William",
    lastName: "Mugwe",
    title: "Dr.",
    specialty: "Medical Laboratory Technologist & General Practice",
    licenseNumber: "KMLTTB-99821",
    kmpdcNumber: "DOC-2026-4481",
    experience: "7",
    hospital: "Swift MD Central Clinic",
    bio: "Dedicated healthcare professional specialized in medical laboratory sciences and clinical diagnostics. Passionate about leveraging digital health technologies to improve patient outcomes across Kenya.",
    languages: "English, Swahili, Kikuyu",
    phone: "+254 712 345 678",
    email: "william.mugwe@swiftmd.co.ke",
    address: "Kenyatta Avenue, Medical Plaza Suite 4B",
    county: "Nairobi",
    consultationLocation: "In-Person & Telehealth Virtual Suite",
    consultationFee: "1,500",
    followUpFee: "1,000",
    emergencyFee: "2,500",
    appointmentDuration: "30",
    bufferTime: "10",
    instantConsultation: true,
    mpesaNumber: "+254 712 345 678 (Paybill: 889922)",
    bankDetails: "Equity Bank • Acc: 0110192837482",
    twoFactor: true,
    notifyEmail: true,
    notifySms: true,
    notifyBookings: true,
    notifyLabs: true
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"Saved" | "Unsaved Changes">("Saved");

  // Availability state for Monday - Sunday
  const [schedule, setSchedule] = useState([
    { day: "Monday", active: true, start: "08:00", end: "17:00" },
    { day: "Tuesday", active: true, start: "08:00", end: "17:00" },
    { day: "Wednesday", active: true, start: "08:00", end: "17:00" },
    { day: "Thursday", active: true, start: "08:00", end: "17:00" },
    { day: "Friday", active: true, start: "08:00", end: "16:00" },
    { day: "Saturday", active: true, start: "09:00", end: "13:00" },
    { day: "Sunday", active: false, start: "09:00", end: "13:00" },
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
    setHasUnsavedChanges(true);
    setSaveStatus("Unsaved Changes");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setHasUnsavedChanges(false);
    setSaveStatus("Saved");
    alert("Profile settings successfully updated and saved to Supabase!");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-32">
      
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link
              href="/doctors/dashboard"
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft size={16} /> Dashboard
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">Edit Doctor Profile</h1>
                <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full flex items-center gap-1 ${saveStatus === "Saved" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                  {saveStatus === "Saved" ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />} {saveStatus}
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                Manage your professional information, availability, and account settings.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <Link
              href="/doctors/profile"
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Eye size={14} /> Preview Profile
            </Link>
            <button
              onClick={handleSave}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <Save size={14} /> Save Changes
            </button>
          </div>
        </div>
      </header>

      {/* ================= MAIN CONTAINER ================= */}
      <form onSubmit={handleSave} className="max-w-7xl mx-auto px-4 md:px-8 pt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT / CENTER: FORM SECTIONS (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* PROFILE OVERVIEW CARD */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
              <User size={16} className="text-blue-600" /> Profile Overview & Photo
            </h3>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl text-white flex items-center justify-center text-2xl font-black shadow-lg">
                  WM
                </div>
                <button type="button" onClick={() => alert("Opening profile photo uploader...")} className="absolute -bottom-2 -right-2 p-2 bg-slate-900 text-white rounded-xl shadow hover:bg-slate-800 transition cursor-pointer">
                  <Camera size={14} />
                </button>
              </div>

              <div className="space-y-1.5 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h4 className="text-lg font-black text-slate-900">Dr. {formData.firstName} {formData.lastName}</h4>
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold rounded-full flex items-center gap-1">
                    <ShieldCheck size={11} /> Verified
                  </span>
                </div>
                <p className="text-xs font-bold text-blue-600">{formData.specialty}</p>
                <p className="text-[11px] text-slate-500 font-medium">License: {formData.licenseNumber} • {formData.experience} Years Exp.</p>
              </div>
            </div>
          </div>

          {/* PROFESSIONAL INFORMATION */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
              <Briefcase size={16} className="text-blue-600" /> Professional Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Professional Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Medical Specialty</label>
                <input
                  type="text"
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Medical License Number</label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">KMPDC / Board Registration Number</label>
                <input
                  type="text"
                  name="kmpdcNumber"
                  value={formData.kmpdcNumber}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Years of Experience</label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Hospital or Clinic Name</label>
                <input
                  type="text"
                  name="hospital"
                  value={formData.hospital}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-blue-600"
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Bio / About Me</label>
                <textarea
                  name="bio"
                  rows={3}
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-blue-600 resize-none"
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Languages Spoken</label>
                <input
                  type="text"
                  name="languages"
                  value={formData.languages}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-blue-600"
                />
              </div>
            </div>
          </div>

          {/* CONTACT INFORMATION */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
              <MapPin size={16} className="text-emerald-600" /> Contact Information & Practice Location
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Clinic Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">County</label>
                <input
                  type="text"
                  name="county"
                  value={formData.county}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-blue-600"
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Consultation Location Details</label>
                <input
                  type="text"
                  name="consultationLocation"
                  value={formData.consultationLocation}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-blue-600"
                />
              </div>
            </div>
          </div>

          {/* AVAILABILITY SCHEDULE */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
              <Clock size={16} className="text-purple-600" /> Weekly Availability Schedule
            </h3>

            <div className="space-y-3 text-xs">
              {schedule.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3 w-full md:w-36">
                    <input
                      type="checkbox"
                      checked={item.active}
                      onChange={(e) => {
                        const updated = [...schedule];
                        updated[idx].active = e.target.checked;
                        setSchedule(updated);
                        setHasUnsavedChanges(true);
                        setSaveStatus("Unsaved Changes");
                      }}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="font-black text-slate-900">{item.day}</span>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">From:</span>
                    <input
                      type="time"
                      value={item.start}
                      disabled={!item.active}
                      onChange={(e) => {
                        const updated = [...schedule];
                        updated[idx].start = e.target.value;
                        setSchedule(updated);
                        setHasUnsavedChanges(true);
                      }}
                      className="p-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 disabled:opacity-50"
                    />
                    <span className="text-[10px] text-slate-400 font-bold uppercase">To:</span>
                    <input
                      type="time"
                      value={item.end}
                      disabled={!item.active}
                      onChange={(e) => {
                        const updated = [...schedule];
                        updated[idx].end = e.target.value;
                        setSchedule(updated);
                        setHasUnsavedChanges(true);
                      }}
                      className="p-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900 disabled:opacity-50"
                    />
                  </div>

                  <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full ${item.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
                    {item.active ? "Available" : "Off"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* CONSULTATION SETTINGS & FEES */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
              <DollarSign size={16} className="text-emerald-600" /> Consultation Fees & Appointment Settings
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Consultation Fee (KES)</label>
                <input
                  type="text"
                  name="consultationFee"
                  value={formData.consultationFee}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Follow-up Fee (KES)</label>
                <input
                  type="text"
                  name="followUpFee"
                  value={formData.followUpFee}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Emergency Fee (KES)</label>
                <input
                  type="text"
                  name="emergencyFee"
                  value={formData.emergencyFee}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Appointment Duration (Mins)</label>
                <input
                  type="number"
                  name="appointmentDuration"
                  value={formData.appointmentDuration}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Buffer Time (Mins)</label>
                <input
                  type="number"
                  name="bufferTime"
                  value={formData.bufferTime}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-blue-600"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700 text-[11px]">Instant Consultation Toggle</span>
                <input
                  type="checkbox"
                  name="instantConsultation"
                  checked={formData.instantConsultation}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </div>
            </div>
          </div>

          {/* PAYMENT SETTINGS */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
              <DollarSign size={16} className="text-blue-600" /> Payment & Payout Configuration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">M-Pesa Paybill / Till Number</label>
                <input
                  type="text"
                  name="mpesaNumber"
                  value={formData.mpesaNumber}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-blue-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase text-[10px]">Bank Account Details</label>
                <input
                  type="text"
                  name="bankDetails"
                  value={formData.bankDetails}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-blue-600"
                />
              </div>
            </div>
          </div>

          {/* CREDENTIALS UPLOAD */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
              <FileText size={16} className="text-indigo-600" /> Professional Credentials & Verifications
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {[
                { title: "Medical Practice License", status: "Verified" },
                { title: "KMLTTB Practicing Certificate", status: "Verified" },
                { title: "Specialist Certification", status: "Verified" },
                { title: "National Identity Card (ID)", status: "Verified" }
              ].map((doc, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-slate-900">{doc.title}</h4>
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                      <ShieldCheck size={12} /> {doc.status}
                    </span>
                  </div>
                  <button type="button" onClick={() => alert(`Uploading replacement for ${doc.title}...`)} className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl transition">
                    Update
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* NOTIFICATION PREFERENCES */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
              <Bell size={16} className="text-amber-600" /> Notification Preferences
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {[
                { label: "Email Appointment Updates", key: "notifyEmail" },
                { label: "SMS Patient Reminders", key: "notifySms" },
                { label: "New Booking Alerts", key: "notifyBookings" },
                { label: "Laboratory Result Alerts", key: "notifyLabs" }
              ].map((pref, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-slate-800">{pref.label}</span>
                  <input
                    type="checkbox"
                    checked={(formData as any)[pref.key]}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, [pref.key]: e.target.checked }));
                      setHasUnsavedChanges(true);
                      setSaveStatus("Unsaved Changes");
                    }}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* SECURITY */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
              <Lock size={16} className="text-red-600" /> Security & Authentication
            </h3>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <button type="button" onClick={() => alert("Password reset link sent to registered email.")} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition">
                Change Password
              </button>
              <button type="button" onClick={() => alert("Two-factor authentication is active via Authenticator App.")} className="px-4 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold rounded-xl transition">
                2FA Enabled (Secure)
              </button>
              <button type="button" onClick={() => alert("Logged out all other active sessions.")} className="px-4 py-2.5 bg-red-50 border border-red-200 text-red-700 font-bold rounded-xl transition">
                Logout All Devices
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT SIDEBAR: PUBLIC PROFILE PREVIEW (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-gradient-to-br from-blue-900 via-slate-900 to-slate-900 rounded-3xl border border-blue-500/30 p-6 text-white space-y-4 shadow-xl sticky top-24">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <div className="p-2 bg-blue-600 text-white rounded-xl">
                <Globe size={16} />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider">Public Profile Preview</h3>
                <p className="text-[10px] text-blue-400 font-bold">As seen by patients</p>
              </div>
            </div>

            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl text-white flex items-center justify-center font-black text-lg">
                  WM
                </div>
                <div>
                  <h4 className="font-black text-white text-sm">Dr. {formData.firstName} {formData.lastName}</h4>
                  <p className="text-[11px] text-blue-400 font-bold">{formData.specialty}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{formData.experience} Years Exp. • 4.9 ⭐ (120 reviews)</p>
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Consultation Fee</span>
                <p className="font-black text-emerald-400 text-sm">KES {formData.consultationFee}</p>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Next Available Slot</span>
                <p className="font-black text-white">Tomorrow, 09:00 AM</p>
              </div>

              <Link
                href="/doctors/profile"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Eye size={14} /> View Full Public Profile
              </Link>
            </div>
          </div>

        </div>

      </form>

      {/* ================= FOOTER ACTIONS ================= */}
      <footer className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 md:px-8 py-3.5 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400 font-bold">
            Status: <span className="text-emerald-600 font-black">{saveStatus}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/doctors/dashboard"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Return to Dashboard
            </Link>
            <Link
              href="/doctors/profile"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Preview Public Profile
            </Link>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
            >
              <Save size={14} /> Save Changes
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}