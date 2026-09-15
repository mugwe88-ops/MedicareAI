// frontend/app/doctors/patients/records/page.tsx
"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  User,
  ArrowLeft,
  ShieldCheck,
  Calendar,
  FileText,
  Pill,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Phone,
  MapPin,
  Heart,
  Thermometer,
  Stethoscope,
  Download,
  Plus,
  Video,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp
} from "lucide-react";

// Mock database for patient medical records keyed by patient ID
const mockMedicalRecordsDatabase: Record<string, {
  id: string;
  name: string;
  dob: string;
  age: number;
  gender: string;
  phone: string;
  county: string;
  bloodGroup: string;
  emergencyContact: { name: string; relation: string; phone: string };
  primaryDoctor: string;
  shaStatus: string;
  lastVisit: string;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
  highRiskWarnings: string[];
  pregnancyStatus: string;
  vitals: { bp: string; hr: string; rr: string; temp: string; o2: string; weight: string; height: string; bmi: string };
  consultations: { date: string; doctor: string; complaint: string; assessment: string; plan: string; followUp: string }[];
  prescriptions: { med: string; dosage: string; status: "Active" | "Completed"; date: string }[];
  labResults: { test: string; result: string; status: "Normal" | "Abnormal"; date: string }[];
  imaging: { type: string; summary: string; date: string }[];
  appointments: { date: string; type: string; status: "Upcoming" | "Completed" | "Missed" }[];
}> = {
  "P-101": {
    id: "P-101",
    name: "Sarah Wanjiku",
    dob: "1994-05-12",
    age: 32,
    gender: "Female",
    phone: "+254 712 345 678",
    county: "Embu",
    bloodGroup: "O+",
    emergencyContact: { name: "John Wanjiku", relation: "Spouse", phone: "+254 722 000 111" },
    primaryDoctor: "Dr. William Mugwe",
    shaStatus: "Verified",
    lastVisit: "2 weeks ago",
    allergies: ["Penicillin", "Sulfa drugs"],
    chronicConditions: ["Mild Asthma"],
    currentMedications: ["Salbutamol Inhaler 100mcg", "Loratadine 10mg"],
    highRiskWarnings: ["Monitor respiratory function during seasonal changes."],
    pregnancyStatus: "Not Applicable",
    vitals: { bp: "120/80 mmHg", hr: "78 bpm", rr: "16 cpm", temp: "37.2°C", o2: "98%", weight: "64 kg", height: "168 cm", bmi: "22.7" },
    consultations: [
      {
        date: "2026-09-01",
        doctor: "Dr. William Mugwe",
        complaint: "Persistent dry cough and throat irritation.",
        assessment: "Acute Bronchitis (J20.9)",
        plan: "Prescribed bronchodilator inhaler and recommended 48-hour follow-up.",
        followUp: "In 2 weeks"
      }
    ],
    prescriptions: [
      { med: "Salbutamol Inhaler", dosage: "2 puffs PRN", status: "Active", date: "2026-09-01" },
      { med: "Amoxicillin 500mg", dosage: "500mg TDS", status: "Completed", date: "2026-08-15" }
    ],
    labResults: [
      { test: "Complete Blood Count (CBC)", result: "WBC 7.5 x10^3/uL (Normal)", status: "Normal", date: "2026-09-01" },
      { test: "Chest X-Ray Screening", result: "Clear lung fields, no consolidation", status: "Normal", date: "2026-09-01" }
    ],
    imaging: [
      { type: "Chest X-Ray (PA View)", summary: "Normal cardiothoracic ratio. Clear pulmonary parenchyma.", date: "2026-09-01" }
    ],
    appointments: [
      { date: "2026-09-16 (Today)", type: "Telehealth Consultation", status: "Upcoming" },
      { date: "2026-09-01", type: "In-Person Visit", status: "Completed" }
    ]
  },
  "P-102": {
    id: "P-102",
    name: "David Kipkorir",
    dob: "1981-03-20",
    age: 45,
    gender: "Male",
    phone: "+254 722 987 654",
    county: "Nairobi",
    bloodGroup: "A+",
    emergencyContact: { name: "Jane Kipkorir", relation: "Spouse", phone: "+254 733 444 555" },
    primaryDoctor: "Dr. William Mugwe",
    shaStatus: "Verified",
    lastVisit: "1 month ago",
    allergies: ["None known"],
    chronicConditions: ["Hypertension", "Type 2 Diabetes"],
    currentMedications: ["Metformin 500mg", "Lisinopril 10mg"],
    highRiskWarnings: ["Routine glycemic index monitoring required."],
    pregnancyStatus: "Not Applicable",
    vitals: { bp: "138/88 mmHg", hr: "82 bpm", rr: "18 cpm", temp: "36.8°C", o2: "97%", weight: "78 kg", height: "175 cm", bmi: "25.5" },
    consultations: [
      {
        date: "2026-08-14",
        doctor: "Dr. William Mugwe",
        complaint: "Routine chronic disease refill check.",
        assessment: "Stable Hypertension & Controlled Diabetes",
        plan: "Continued current medication regimen with monthly review.",
        followUp: "In 1 month"
      }
    ],
    prescriptions: [
      { med: "Metformin 500mg", dosage: "1 tab BD", status: "Active", date: "2026-08-14" },
      { med: "Lisinopril 10mg", dosage: "1 tab daily", status: "Active", date: "2026-08-14" }
    ],
    labResults: [
      { test: "HbA1c Test", result: "6.8% (Controlled)", status: "Normal", date: "2026-08-14" },
      { test: "Fast Blood Sugar", result: "6.2 mmol/L", status: "Normal", date: "2026-08-14" }
    ],
    imaging: [
      { type: "ECG 12-Lead", summary: "Normal sinus rhythm. No acute ST-T wave abnormalities.", date: "2026-08-14" }
    ],
    appointments: [
      { date: "2026-09-18", type: "Chronic Review", status: "Upcoming" }
    ]
  }
};

function PatientRecordsContent() {
  const searchParams = useSearchParams();
  const patientId = searchParams.get("id") || "P-101";
  const patient = mockMedicalRecordsDatabase[patientId];

  const [expandedConsultation, setExpandedConsultation] = useState<number | null>(0);

  // Empty State if invalid patient ID
  if (!patient) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 bg-red-500/15 border border-red-500/30 text-red-400 rounded-2xl flex items-center justify-center mx-auto">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-lg font-black text-white">Patient Not Found</h2>
          <p className="text-xs text-slate-400">
            No medical record matches ID <code className="text-blue-400 font-mono font-bold">{patientId}</code>. Please return to the appointments list.
          </p>
          <Link
            href="/doctors/appointments"
            className="inline-flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-600/30 transition cursor-pointer"
          >
            <ArrowLeft size={16} /> Return to Appointments
          </Link>
        </div>
      </div>
    );
  }

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
                <h1 className="text-xl font-black text-slate-900 tracking-tight">{patient.name}</h1>
                <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-md font-bold">{patient.id}</span>
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold rounded-full flex items-center gap-1">
                  <ShieldCheck size={11} /> SHA: {patient.shaStatus}
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                {patient.gender}, {patient.age} yrs • Last visit: {patient.lastVisit}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
            <Link
              href={`/doctors/telehealth/room?patientId=${patient.id}`}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <Video size={14} /> Start Consultation
            </Link>
            <Link
              href="/doctors/prescriptions/new"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <Pill size={14} /> Write Prescription
            </Link>
            <Link
              href="/doctors/labs"
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <FileText size={14} /> Order Lab
            </Link>
          </div>
        </div>
      </header>

      {/* ================= MAIN CONTAINER ================= */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT / CENTER: MEDICAL RECORD SECTIONS (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* PATIENT SUMMARY CARD */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
              <User size={16} className="text-blue-600" /> Patient Demographics & Summary
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Full Name</span>
                <p className="font-black text-slate-900">{patient.name}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Date of Birth</span>
                <p className="font-black text-slate-900">{patient.dob}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Phone Number</span>
                <p className="font-black text-slate-900">{patient.phone}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">County</span>
                <p className="font-black text-slate-900">{patient.county}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Blood Group</span>
                <p className="font-black text-blue-600">{patient.bloodGroup}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Emergency Contact</span>
                <p className="font-black text-slate-900">{patient.emergencyContact.name} ({patient.emergencyContact.relation})</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Emergency Phone</span>
                <p className="font-black text-slate-900">{patient.emergencyContact.phone}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Primary Doctor</span>
                <p className="font-black text-slate-900">{patient.primaryDoctor}</p>
              </div>
            </div>
          </div>

          {/* MEDICAL ALERTS SECTION */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-600" /> Clinical Alerts & Medical Warnings
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl space-y-1">
                <span className="text-[10px] font-extrabold text-red-700 uppercase tracking-wider block">Known Allergies</span>
                <p className="font-bold text-red-900">{patient.allergies.join(", ")}</p>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-1">
                <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider block">Chronic Conditions</span>
                <p className="font-bold text-amber-900">{patient.chronicConditions.join(", ")}</p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-1">
                <span className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider block">Current Medications</span>
                <p className="font-bold text-blue-900">{patient.currentMedications.join(", ")}</p>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl space-y-1">
                <span className="text-[10px] font-extrabold text-purple-700 uppercase tracking-wider block">High-Risk Warnings</span>
                <p className="font-bold text-purple-900">{patient.highRiskWarnings.join(", ")}</p>
              </div>
            </div>
          </div>

          {/* VITALS SECTION */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Activity size={16} className="text-emerald-600" /> Recent Vital Signs & Anthropometrics
              </h3>
              <span className="text-[10px] font-bold text-slate-400">Recorded: 2026-09-01</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Blood Pressure</span>
                <p className="font-black text-slate-900 text-sm mt-0.5">{patient.vitals.bp}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Heart Rate</span>
                <p className="font-black text-slate-900 text-sm mt-0.5">{patient.vitals.hr}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Respiratory Rate</span>
                <p className="font-black text-slate-900 text-sm mt-0.5">{patient.vitals.rr}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Temperature</span>
                <p className="font-black text-slate-900 text-sm mt-0.5">{patient.vitals.temp}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Oxygen Saturation</span>
                <p className="font-black text-slate-900 text-sm mt-0.5">{patient.vitals.o2}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Weight</span>
                <p className="font-black text-slate-900 text-sm mt-0.5">{patient.vitals.weight}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Height</span>
                <p className="font-black text-slate-900 text-sm mt-0.5">{patient.vitals.height}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">BMI Index</span>
                <p className="font-black text-blue-600 text-sm mt-0.5">{patient.vitals.bmi}</p>
              </div>
            </div>

            {/* Trend Chart Placeholder */}
            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-center justify-between text-xs text-blue-900 font-bold">
              <span>📈 Vitals Historical Trend Chart: Stable over last 3 visits.</span>
              <span className="text-[10px] text-blue-600 underline cursor-pointer">View Full Graph</span>
            </div>
          </div>

          {/* CONSULTATION NOTES (Expandable) */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
              <Stethoscope size={16} className="text-blue-600" /> Consultation Notes & History
            </h3>

            <div className="space-y-3">
              {patient.consultations.map((con, idx) => {
                const isExpanded = expandedConsultation === idx;
                return (
                  <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
                    <div
                      onClick={() => setExpandedConsultation(isExpanded ? null : idx)}
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 text-white rounded-xl">
                          <Stethoscope size={16} />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-900">{con.assessment}</h4>
                          <p className="text-[11px] text-slate-500">{con.doctor} • {con.date}</p>
                        </div>
                      </div>
                      <button className="text-slate-400 hover:text-slate-600">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="p-4 bg-white border-t border-slate-200 space-y-3 text-xs">
                        <div>
                          <span className="font-bold text-slate-400 uppercase text-[10px]">Chief Complaint:</span>
                          <p className="text-slate-800 font-medium">{con.complaint}</p>
                        </div>
                        <div>
                          <span className="font-bold text-slate-400 uppercase text-[10px]">Assessment / Diagnosis:</span>
                          <p className="text-slate-800 font-medium">{con.assessment}</p>
                        </div>
                        <div>
                          <span className="font-bold text-slate-400 uppercase text-[10px]">Treatment Plan:</span>
                          <p className="text-slate-800 font-medium">{con.plan}</p>
                        </div>
                        <div>
                          <span className="font-bold text-slate-400 uppercase text-[10px]">Follow-up Instructions:</span>
                          <p className="text-slate-800 font-medium">{con.followUp}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* PRESCRIPTIONS */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Pill size={16} className="text-blue-600" /> Prescriptions & Refill Status
              </h3>
              <Link
                href="/doctors/prescriptions/new"
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl transition flex items-center gap-1"
              >
                <Plus size={14} /> Write Prescription
              </Link>
            </div>

            <div className="space-y-3 text-xs">
              {patient.prescriptions.map((rx, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-slate-900">{rx.med}</h4>
                    <p className="text-slate-500 text-[11px]">Dosage: {rx.dosage} • Prescribed: {rx.date}</p>
                  </div>
                  <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full ${rx.status === "Active" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`}>
                    {rx.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* LABORATORY RESULTS */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileText size={16} className="text-purple-600" /> Laboratory Results
              </h3>
              <Link
                href="/doctors/labs"
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl transition flex items-center gap-1"
              >
                <Plus size={14} /> Order Lab Test
              </Link>
            </div>

            <div className="space-y-3 text-xs">
              {patient.labResults.map((lab, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-slate-900">{lab.test}</h4>
                    <p className="text-slate-600 text-[11px] font-medium">{lab.result} • {lab.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full">{lab.status}</span>
                    <button onClick={() => alert("Downloading lab report PDF...")} className="p-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl transition cursor-pointer">
                      <Download size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* IMAGING */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
              <FileText size={16} className="text-indigo-600" /> Imaging & Radiology Reports
            </h3>

            <div className="space-y-3 text-xs">
              {patient.imaging.map((img, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-slate-900">{img.type}</h4>
                    <span className="text-[10px] text-slate-400 font-bold">{img.date}</span>
                  </div>
                  <p className="text-slate-600 font-medium">{img.summary}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT SIDEBAR: AI ASSISTANT & APPOINTMENT HISTORY (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* APPOINTMENT HISTORY */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
              Appointment History
            </h3>

            <div className="space-y-3 text-xs">
              {patient.appointments.map((app, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-slate-900">{app.type}</h4>
                    <span className="text-[10px] text-slate-400 font-bold">{app.date}</span>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${app.status === "Upcoming" ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"}`}>
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI CLINICAL ASSISTANT PANEL */}
          <div className="bg-gradient-to-br from-blue-900 via-slate-900 to-slate-900 rounded-3xl border border-blue-500/30 p-6 text-white space-y-4 shadow-xl">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <div className="p-2 bg-blue-600 text-white rounded-xl">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider">Swift MD Clinical AI</h3>
                <p className="text-[10px] text-blue-400 font-bold">Patient Health Insights</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-black text-amber-400 uppercase">Drug Interaction Warning</span>
                <p className="text-slate-300 font-medium">Verified: No contraindications with active prescriptions ({patient.currentMedications.join(", ")}).</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-black text-emerald-400 uppercase">Preventive Care Reminder</span>
                <p className="text-slate-300 font-medium">Annual flu vaccination recommended for patient profile.</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-black text-blue-400 uppercase">Guideline Recommendation</span>
                <p className="text-slate-300 font-medium">Follow WHO protocols for chronic symptom management.</p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ================= FOOTER ACTIONS ================= */}
      <footer className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 md:px-8 py-3.5 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400 font-bold">
            Record ID: <code className="text-blue-600 font-mono">REC-{patient.id}-ACTIVE</code>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href={`/doctors/telehealth/room?patientId=${patient.id}`}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
            >
              <Video size={14} /> Start Consultation
            </Link>
            <Link
              href="/doctors/prescriptions/new"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
            >
              <Pill size={14} /> Write Prescription
            </Link>
            <Link
              href="/doctors/labs"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5"
            >
              <FileText size={14} /> Order Lab
            </Link>
            <button
              onClick={() => alert("Downloading complete medical summary PDF...")}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5"
            >
              <Download size={14} /> Download Summary
            </button>
            <Link
              href="/doctors/appointments"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Return to Appointments
            </Link>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function PatientRecordsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xs font-bold">
        Loading Patient Medical Records...
      </div>
    }>
      <PatientRecordsContent />
    </Suspense>
  );
}