// frontend/app/doctors/patients/new/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  User,
  ArrowLeft,
  ShieldCheck,
  Scan,
  Camera,
  Search,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Heart,
  Pill,
  FileText,
  Activity,
  Plus
} from "lucide-react";

export default function NewPatientRegistrationPage() {
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [duplicateWarning, setDuplicateWarning] = useState(false);

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [dob, setDob] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [gender, setGender] = useState("Female");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [county, setCounty] = useState("Embu");
  const [address, setAddress] = useState("");

  // Emergency Contact
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyRelation, setEmergencyRelation] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");

  // Medical Info
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [allergies, setAllergies] = useState("");
  const [chronicConditions, setChronicConditions] = useState("");
  const [currentMedications, setCurrentMedications] = useState("");
  const [pregnancyStatus, setPregnancyStatus] = useState("Not Applicable");

  // SHA & Insurance
  const [shaNumber, setShaNumber] = useState("");
  const [shaStatus, setShaStatus] = useState<"Unverified" | "Verified" | "Eligible">("Unverified");
  const [insuranceType, setInsuranceType] = useState<"Cash" | "SHA" | "Private">("SHA");
  const [insuranceProvider, setInsuranceProvider] = useState("SHA Kenya");
  const [policyNumber, setPolicyNumber] = useState("");

  // Auto-calculate age on DOB change
  const handleDobChange = (value: string) => {
    setDob(value);
    if (value) {
      const birthDate = new Date(value);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      setAge(calculatedAge >= 0 ? calculatedAge : "");
    } else {
      setAge("");
    }
  };

  const handleIdSearch = (idVal: string) => {
    setNationalId(idVal);
    // Simulate duplicate check detection
    if (idVal === "31245678") {
      setDuplicateWarning(true);
    } else {
      setDuplicateWarning(false);
    }
  };

  const handleVerifySHA = () => {
    if (!shaNumber) {
      alert("Please enter a valid SHA Member Number.");
      return;
    }
    setShaStatus("Verified");
    alert("SHA Membership successfully verified with the Social Health Authority database.");
  };

  const handleSubmit = (actionType: string) => {
    if (!firstName || !lastName || !phone) {
      alert("Please fill in all required personal information fields (First Name, Last Name, Phone Number).");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSuccessMessage(`Patient profile for ${firstName} ${lastName} successfully ${actionType}!`);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-32">
      
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link
              href="/doctors/patients"
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft size={16} /> Patients
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">Register New Patient</h1>
                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-extrabold rounded-full flex items-center gap-1">
                  <ShieldCheck size={11} /> SHA Integrated
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                Create a patient profile and enroll in SHA if eligible.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <Link
              href="/doctors/patients"
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={() => handleSubmit("saved as draft")}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit("registered successfully")}
              disabled={submitting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-md shadow-blue-600/20 transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 size={15} /> {submitting ? "Processing..." : "Register Patient"}
            </button>
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
            <Link href="/doctors/patients" className="underline font-black">View All Patients</Link>
          </div>
        </div>
      )}

      {/* Duplicate Warning Banner */}
      {duplicateWarning && (
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-amber-800 text-xs font-bold">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-600" />
              <span><strong>Duplicate Warning:</strong> A patient record with National ID {nationalId} already exists in the system.</span>
            </div>
            <Link href="/doctors/patients" className="underline font-black">View Existing Record</Link>
          </div>
        </div>
      )}

      {/* ================= MAIN CONTAINER ================= */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT / CENTER: REGISTRATION FORM (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* QUICK FEATURES: ID SCAN & PHOTO CAPTURE */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
              <Scan size={16} className="text-blue-600" /> Rapid Onboarding & Verification Tools
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => alert("Opening National ID camera scanner... (Simulated: scanned ID #31245678)")}
                className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl transition flex items-center gap-3 text-left cursor-pointer group"
              >
                <div className="p-3 bg-blue-600 text-white rounded-xl group-hover:scale-105 transition">
                  <Scan size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Scan National ID / Passport</h4>
                  <p className="text-[11px] text-slate-400">Auto-fill personal info using OCR camera.</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => alert("Activating webcam for patient portrait capture...")}
                className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl transition flex items-center gap-3 text-left cursor-pointer group"
              >
                <div className="p-3 bg-emerald-600 text-white rounded-xl group-hover:scale-105 transition">
                  <Camera size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Capture Patient Photo</h4>
                  <p className="text-[11px] text-slate-400">Take passport picture for telehealth profile.</p>
                </div>
              </button>
            </div>
          </div>

          {/* PERSONAL INFORMATION */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
              <User size={16} className="text-blue-600" /> Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">First Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Sarah"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Last Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Wanjiku"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">National ID / Passport</label>
                <input
                  type="text"
                  placeholder="e.g., 31245678 (Type this to trigger duplicate warning)"
                  value={nationalId}
                  onChange={(e) => handleIdSearch(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => handleDobChange(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Age</label>
                  <input
                    type="number"
                    disabled
                    value={age}
                    placeholder="Auto"
                    className="w-full px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Phone Number *</label>
                <input
                  type="text"
                  placeholder="e.g., +254 712 345 678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g., sarah.wanjiku@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">County</label>
                <select
                  value={county}
                  onChange={(e) => setCounty(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                >
                  <option value="Embu">Embu</option>
                  <option value="Nairobi">Nairobi</option>
                  <option value="Laikipia">Laikipia</option>
                  <option value="Kiambu">Kiambu</option>
                  <option value="Nakuru">Nakuru</option>
                  <option value="Mombasa">Mombasa</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Residential Address / Estate</label>
              <input
                type="text"
                placeholder="e.g., Majengo Estate, House 42"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>
          </div>

          {/* EMERGENCY CONTACT */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
              <Phone size={16} className="text-rose-600" /> Emergency Contact
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Contact Name</label>
                <input
                  type="text"
                  placeholder="e.g., John Wanjiku"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Relationship</label>
                <input
                  type="text"
                  placeholder="e.g., Spouse / Brother"
                  value={emergencyRelation}
                  onChange={(e) => setEmergencyRelation(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g., +254 722 000 111"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>
            </div>
          </div>

          {/* MEDICAL INFORMATION */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
              <Activity size={16} className="text-purple-600" /> Medical Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                >
                  <option value="O+">O Positive (O+)</option>
                  <option value="O-">O Negative (O-)</option>
                  <option value="A+">A Positive (A+)</option>
                  <option value="A-">A Negative (A-)</option>
                  <option value="B+">B Positive (B+)</option>
                  <option value="B-">B Negative (B-)</option>
                  <option value="AB+">AB Positive (AB+)</option>
                  <option value="AB-">AB Negative (AB-)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Pregnancy Status</label>
                <select
                  value={pregnancyStatus}
                  onChange={(e) => setPregnancyStatus(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                >
                  <option value="Not Applicable">Not Applicable</option>
                  <option value="First Trimester">First Trimester</option>
                  <option value="Second Trimester">Second Trimester</option>
                  <option value="Third Trimester">Third Trimester</option>
                  <option value="Not Pregnant">Not Pregnant</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Known Allergies</label>
                <input
                  type="text"
                  placeholder="e.g., Penicillin, Sulfa drugs, Peanuts"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Chronic Conditions</label>
                <input
                  type="text"
                  placeholder="e.g., Hypertension, Asthma, Diabetes"
                  value={chronicConditions}
                  onChange={(e) => setChronicConditions(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Current Medications</label>
              <input
                type="text"
                placeholder="e.g., Salbutamol inhaler, Lisinopril 10mg"
                value={currentMedications}
                onChange={(e) => setCurrentMedications(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>
          </div>

          {/* DEDICATED SHA & INSURANCE SECTION */}
          <div className="bg-gradient-to-br from-blue-900 via-slate-900 to-slate-900 rounded-3xl border border-blue-500/30 p-6 text-white space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-600 text-white rounded-xl">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider">Social Health Authority (SHA) & Insurance</h3>
                  <p className="text-[10px] text-blue-400 font-bold">National Health Insurance Enrollment</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold rounded-full">
                Status: {shaStatus}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Primary Payment / Insurance Type</label>
                <select
                  value={insuranceType}
                  onChange={(e) => setInsuranceType(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-600/40"
                >
                  <option value="SHA">SHA (Social Health Authority)</option>
                  <option value="Private">Private Insurance</option>
                  <option value="Cash">Cash / Out-of-Pocket</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">SHA Member Number</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g., SHA-99482910"
                    value={shaNumber}
                    onChange={(e) => setShaNumber(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-600/40"
                  />
                  <button
                    type="button"
                    onClick={handleVerifySHA}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl transition cursor-pointer shrink-0"
                  >
                    Verify
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Insurance Provider</label>
                <input
                  type="text"
                  value={insuranceProvider}
                  onChange={(e) => setInsuranceProvider(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-600/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Policy / Member ID</label>
                <input
                  type="text"
                  placeholder="e.g., POL-883920"
                  value={policyNumber}
                  onChange={(e) => setPolicyNumber(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-600/40"
                />
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT SIDEBAR: CHECKLIST & RECENT PATIENTS (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* REGISTRATION CHECKLIST */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
              Registration Checklist
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2.5 text-slate-700 font-medium">
                <CheckCircle2 size={16} className={firstName && lastName ? "text-emerald-600" : "text-slate-300"} />
                <span>Basic Demographics (Name & DOB)</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700 font-medium">
                <CheckCircle2 size={16} className={phone ? "text-emerald-600" : "text-slate-300"} />
                <span>Valid Contact Number</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700 font-medium">
                <CheckCircle2 size={16} className={shaNumber ? "text-emerald-600" : "text-slate-300"} />
                <span>SHA / Insurance Verification</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700 font-medium">
                <CheckCircle2 size={16} className={allergies ? "text-emerald-600" : "text-slate-300"} />
                <span>Allergy & Medical History Notes</span>
              </div>
            </div>
          </div>

          {/* RECENTLY ADDED PATIENTS */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
              Recently Enrolled Patients
            </h3>

            <div className="space-y-3">
              {[
                { name: "Sarah Wanjiku", time: "10 mins ago", id: "SHA-994821" },
                { name: "David Kipkorir", time: "1 hour ago", id: "SHA-883920" },
                { name: "Amina Mohamed", time: "3 hours ago", id: "SHA-772910" }
              ].map((pat, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-slate-900">{pat.name}</h4>
                    <span className="text-[10px] text-slate-400 font-bold">{pat.id}</span>
                  </div>
                  <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full">{pat.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* TIPS FOR COMPLETION */}
          <div className="bg-blue-50 rounded-3xl border border-blue-200 p-6 space-y-2">
            <h4 className="text-xs font-black text-blue-900 uppercase">Registration Tip</h4>
            <p className="text-xs text-blue-800 leading-relaxed font-medium">
              Verifying the SHA Member Number prior to starting consultation ensures instant claim validation and seamless billing for government-subsidized care packages.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}