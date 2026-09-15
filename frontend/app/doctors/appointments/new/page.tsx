// frontend/app/doctors/appointments/new/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  ArrowLeft,
  ShieldCheck,
  Search,
  CheckCircle2,
  Video,
  MapPin,
  Bell,
  FileText,
  AlertCircle,
  Plus,
  Stethoscope,
  Send
} from "lucide-react";

// Mock existing patients database for search selection
const mockPatientsList = [
  { id: "P-101", name: "Sarah Wanjiku", phone: "+254 712 345 678", nationalId: "31245678", age: 32, gender: "Female", shaStatus: "Verified", lastVisit: "2 weeks ago" },
  { id: "P-102", name: "David Kipkorir", phone: "+254 722 987 654", nationalId: "28910293", age: 45, gender: "Male", shaStatus: "Verified", lastVisit: "1 month ago" },
  { id: "P-103", name: "Amina Mohamed", phone: "+254 733 112 233", nationalId: "33445566", age: 28, gender: "Female", shaStatus: "Unverified", lastVisit: "First visit" }
];

export default function BookAppointmentPage() {
  // Patient Search & Selection State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(mockPatientsList[0]);
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);

  // New Patient Quick-Add State
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newNationalId, setNewNationalId] = useState("");

  // Appointment Details State
  const [appointmentType, setAppointmentType] = useState<"Telehealth" | "In-Person" | "Follow-up" | "Emergency" | "Home Visit">("Telehealth");
  const [doctorName, setDoctorName] = useState("Dr. William Mugwe");
  const [specialty, setSpecialty] = useState("General Practice & Family Medicine");
  const [location, setLocation] = useState("Embu Level 5 Hospital / Swift MD Virtual Clinic");
  const [date, setDate] = useState("2026-09-16");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("10:00 AM");
  const [duration, setDuration] = useState("30");
  const [priority, setPriority] = useState<"Routine" | "High" | "Urgent" | "Emergency">("Routine");

  // Visit Information State
  const [reasonForVisit, setReasonForVisit] = useState("Persistent dry cough and mild fever");
  const [symptoms, setSymptoms] = useState("Cough, throat irritation, fatigue");
  const [referralSource, setReferralSource] = useState("Walk-in / Direct booking");
  const [patientNotes, setPatientNotes] = useState("Please join 5 minutes prior to session.");
  const [internalNotes, setInternalNotes] = useState("Check SHA verification status before proceeding.");

  // Notifications State
  const [sendSms, setSendSms] = useState(true);
  const [sendEmail, setSendEmail] = useState(true);
  const [sendInApp, setSendInApp] = useState(true);
  const [reminder24h, setReminder24h] = useState(true);
  const [reminder1h, setReminder1h] = useState(true);

  // Submission Status
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const filteredPatients = mockPatientsList.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery) ||
      p.nationalId.includes(searchQuery) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleQuickRegisterPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFirstName || !newLastName || !newPhone) {
      alert("Please fill in required fields for quick patient registration.");
      return;
    }
    const createdPatient = {
      id: `P-10${mockPatientsList.length + 1}`,
      name: `${newFirstName} ${newLastName}`,
      phone: newPhone,
      nationalId: newNationalId || "Pending",
      age: 30,
      gender: "Not Specified",
      shaStatus: "Unverified",
      lastVisit: "Just registered"
    };
    setSelectedPatient(createdPatient);
    setShowNewPatientModal(false);
    alert(`Patient ${createdPatient.name} successfully registered and selected!`);
  };

  const handleBookAppointment = (actionType: string) => {
    if (!selectedPatient) {
      alert("Please select or register a patient before booking.");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      if (actionType === "start") {
        setSuccessMessage("Appointment booked! Redirecting to live consultation room...");
      } else {
        setSuccessMessage(`Appointment successfully booked for ${selectedPatient.name} (${date} at ${selectedTimeSlot})!`);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-32">
      
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link
              href="/doctors/appointments"
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft size={16} /> Appointments
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">Book Appointment</h1>
                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-extrabold rounded-full flex items-center gap-1">
                  <ShieldCheck size={11} /> SHA Integrated
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                Schedule an in-person or telehealth visit for a patient.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <Link
              href="/doctors/appointments"
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={() => handleBookAppointment("draft")}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => handleBookAppointment("book")}
              disabled={submitting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-md shadow-blue-600/20 transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 size={15} /> {submitting ? "Processing..." : "Book Appointment"}
            </button>
            {appointmentType === "Telehealth" && (
              <button
                type="button"
                onClick={() => handleBookAppointment("start")}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-600/20 transition cursor-pointer flex items-center gap-2"
              >
                <Video size={15} /> Book & Start
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-4">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-800 text-xs font-bold">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-600" />
              <span>{successMessage}</span>
            </div>
            <Link href="/doctors/appointments" className="underline font-black">View All Appointments</Link>
          </div>
        </div>
      )}

      {/* ================= MAIN CONTAINER ================= */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT / CENTER: BOOKING FORM (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* PATIENT SELECTION CARD */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <User size={16} className="text-blue-600" /> Patient Selection
              </h3>
              <button
                type="button"
                onClick={() => setShowNewPatientModal(true)}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1"
              >
                <Plus size={14} /> Register New Patient
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search patient by name, phone, National ID, or Patient ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>

            {/* Search Results Dropdown / List */}
            {searchQuery && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2 max-h-48 overflow-y-auto space-y-1">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((pat) => (
                    <div
                      key={pat.id}
                      onClick={() => {
                        setSelectedPatient(pat);
                        setSearchQuery("");
                      }}
                      className="p-2.5 hover:bg-blue-50 rounded-xl cursor-pointer flex items-center justify-between transition"
                    >
                      <div>
                        <h4 className="text-xs font-black text-slate-900">{pat.name} ({pat.id})</h4>
                        <p className="text-[11px] text-slate-500">{pat.phone} • ID: {pat.nationalId}</p>
                      </div>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-100/60 px-2 py-0.5 rounded-full">Select</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-3">No patients found. Click "Register New Patient" above.</p>
                )}
              </div>
            )}

            {/* Selected Patient Summary Card */}
            {selectedPatient && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-slate-50 border border-blue-200 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black text-sm shadow-md">
                    {selectedPatient.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-slate-900">{selectedPatient.name}</h4>
                      <span className="text-[10px] font-mono text-blue-600 font-bold bg-blue-100 px-2 py-0.5 rounded">{selectedPatient.id}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {selectedPatient.gender}, {selectedPatient.age} yrs • {selectedPatient.phone} • Last Visit: {selectedPatient.lastVisit}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full flex items-center gap-1">
                    <ShieldCheck size={12} /> SHA: {selectedPatient.shaStatus}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* APPOINTMENT DETAILS CARD */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
              <CalendarIcon size={16} className="text-blue-600" /> Appointment Details & Scheduling
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Appointment Type</label>
                <select
                  value={appointmentType}
                  onChange={(e) => setAppointmentType(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                >
                  <option value="Telehealth">Telehealth Video Visit</option>
                  <option value="In-Person">In-Person Consultation</option>
                  <option value="Follow-up">Follow-up Visit</option>
                  <option value="Emergency">Emergency Consultation</option>
                  <option value="Home Visit">Home Visit</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Doctor (Preselected)</label>
                <input
                  type="text"
                  disabled
                  value={doctorName}
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Medical Specialty</label>
                <input
                  type="text"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Clinic / Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Appointment Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Duration</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                >
                  <option value="15">15 Minutes</option>
                  <option value="30">30 Minutes</option>
                  <option value="45">45 Minutes</option>
                  <option value="60">60 Minutes</option>
                </select>
              </div>
            </div>

            {/* Live Availability Time Slots Grid */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Live Availability & Time Slots</label>
                <span className="text-[10px] text-slate-400 font-bold">Working Hours: 08:00 AM - 05:00 PM (EAT)</span>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {[
                  { time: "09:00 AM", booked: true },
                  { time: "09:30 AM", booked: true },
                  { time: "10:00 AM", booked: false },
                  { time: "10:30 AM", booked: false },
                  { time: "11:00 AM", booked: false },
                  { time: "11:30 AM", booked: true },
                  { time: "02:00 PM", booked: false },
                  { time: "02:30 PM", booked: false },
                  { time: "03:00 PM", booked: true },
                  { time: "03:30 PM", booked: false },
                  { time: "04:00 PM", booked: false },
                  { time: "04:30 PM", booked: false }
                ].map((slot, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={slot.booked}
                    onClick={() => setSelectedTimeSlot(slot.time)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 ${
                      slot.booked
                        ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed line-through"
                        : selectedTimeSlot === slot.time
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 cursor-pointer"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 cursor-pointer"
                    }`}
                  >
                    <Clock size={13} />
                    <span>{slot.time}</span>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 italic">Includes 10-minute buffer time between appointments.</p>
            </div>
          </div>

          {/* VISIT INFORMATION */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
              <FileText size={16} className="text-purple-600" /> Visit Information & Clinical Notes
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Reason for Visit</label>
                <input
                  type="text"
                  value={reasonForVisit}
                  onChange={(e) => setReasonForVisit(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Symptoms / Chief Complaint</label>
                <input
                  type="text"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Referral Source</label>
                <input
                  type="text"
                  value={referralSource}
                  onChange={(e) => setReferralSource(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Priority Level</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                >
                  <option value="Routine">Routine</option>
                  <option value="High">High Priority</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Notes for Patient</label>
                <textarea
                  rows={2}
                  value={patientNotes}
                  onChange={(e) => setPatientNotes(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Internal Doctor Notes</label>
                <textarea
                  rows={2}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 resize-none"
                />
              </div>
            </div>
          </div>

          {/* TELEHEALTH & NOTIFICATIONS OPTIONS */}
          {appointmentType === "Telehealth" && (
            <div className="bg-gradient-to-br from-blue-900 via-slate-900 to-slate-900 rounded-3xl border border-blue-500/30 p-6 text-white space-y-4 shadow-xl">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <div className="p-2 bg-blue-600 text-white rounded-xl">
                  <Video size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider">Telehealth Integration & Auto-Room</h3>
                  <p className="text-[10px] text-blue-400 font-bold">Secure HIPAA-compliant virtual link generation</p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Generated Secure Room URL</span>
                  <p className="text-xs font-mono text-blue-400">https://swifttel.health/doctors/telehealth/room?patientId={selectedPatient?.id || "P-101"}</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-lg">Ready</span>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS CONFIG */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
              <Bell size={16} className="text-emerald-600" /> Automated Patient Notifications
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
              <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer font-bold text-slate-700">
                <input type="checkbox" checked={sendSms} onChange={(e) => setSendSms(e.target.checked)} className="rounded text-blue-600" />
                <span>SMS</span>
              </label>
              <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer font-bold text-slate-700">
                <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} className="rounded text-blue-600" />
                <span>Email</span>
              </label>
              <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer font-bold text-slate-700">
                <input type="checkbox" checked={sendInApp} onChange={(e) => setSendInApp(e.target.checked)} className="rounded text-blue-600" />
                <span>In-App</span>
              </label>
              <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer font-bold text-slate-700">
                <input type="checkbox" checked={reminder24h} onChange={(e) => setReminder24h(e.target.checked)} className="rounded text-blue-600" />
                <span>24h Reminder</span>
              </label>
              <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer font-bold text-slate-700">
                <input type="checkbox" checked={reminder1h} onChange={(e) => setReminder1h(e.target.checked)} className="rounded text-blue-600" />
                <span>1h Reminder</span>
              </label>
            </div>
          </div>

        </div>

        {/* RIGHT SIDEBAR: SCHEDULE SUMMARY (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* APPOINTMENT SUMMARY CARD */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
              Booking Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400 font-bold">Patient:</span>
                <span className="font-black text-slate-900">{selectedPatient?.name || "None selected"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400 font-bold">Type:</span>
                <span className="font-black text-blue-600">{appointmentType}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400 font-bold">Date & Time:</span>
                <span className="font-black text-slate-900">{date} at {selectedTimeSlot}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400 font-bold">Duration:</span>
                <span className="font-black text-slate-900">{duration} Minutes</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400 font-bold">Consultation Load:</span>
                <span className="font-black text-emerald-600">65% (Optimal)</span>
              </div>
            </div>
          </div>

          {/* TODAY'S SCHEDULE OVERVIEW */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
              Today's Schedule (Sep 16)
            </h3>

            <div className="space-y-3">
              {[
                { time: "09:00 AM", patient: "Sarah Wanjiku", type: "Telehealth" },
                { time: "11:30 AM", patient: "David Kipkorir", type: "In-Person" },
                { time: "03:00 PM", patient: "Amina Mohamed", type: "Follow-up" }
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-slate-900">{item.patient}</h4>
                    <span className="text-[10px] text-slate-400 font-bold">{item.type}</span>
                  </div>
                  <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full">{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* NEXT AVAILABLE SLOT */}
          <div className="bg-blue-50 rounded-3xl border border-blue-200 p-6 space-y-2">
            <h4 className="text-xs font-black text-blue-900 uppercase">Next Available Slot</h4>
            <p className="text-xs text-blue-800 font-medium">
              Today at <strong className="font-black">10:00 AM</strong> is currently selected for booking. Next open window is 02:00 PM.
            </p>
          </div>

        </div>

      </div>

      {/* ================= QUICK NEW PATIENT MODAL ================= */}
      {showNewPatientModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 uppercase">Quick Patient Registration</h3>
              <button onClick={() => setShowNewPatientModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-xs">Close</button>
            </div>

            <form onSubmit={handleQuickRegisterPatient} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">First Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Jane"
                  value={newFirstName}
                  onChange={(e) => setNewFirstName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Last Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Akinyi"
                  value={newLastName}
                  onChange={(e) => setNewLastName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Phone Number *</label>
                <input
                  type="text"
                  placeholder="e.g., +254 711 222 333"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">National ID</label>
                <input
                  type="text"
                  placeholder="e.g., 34567890"
                  value={newNationalId}
                  onChange={(e) => setNewNationalId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewPatientModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-black text-xs rounded-xl shadow-md"
                >
                  Register & Select
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}