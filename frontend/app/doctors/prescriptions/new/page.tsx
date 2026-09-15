// frontend/app/doctors/prescriptions/new/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Pill,
  Search,
  ShieldCheck,
  Plus,
  Trash2,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  FileText,
  Printer,
  Send,
  User,
  Calendar,
  Activity,
  Lock
} from "lucide-react";

interface MedicationItem {
  id: string;
  drugName: string;
  genericName: string;
  strength: string;
  dosage: string;
  route: string;
  frequency: string;
  duration: string;
  quantity: number;
  instructions: string;
}

export default function NewPrescriptionPage() {
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Patient Context (Mocked for active consultation)
  const patient = {
    name: "Sarah Wanjiku",
    age: 32,
    gender: "Female",
    weight: "64 kg",
    allergies: ["Penicillin", "Sulfa drugs"],
    currentMedications: ["Salbutamol Inhaler"],
    chronicConditions: ["Mild Asthma", "Hypertension"]
  };

  // Medications List State
  const [medications, setMedications] = useState<MedicationItem[]>([
    {
      id: "med-1",
      drugName: "Lisinopril 10mg Tablet",
      genericName: "Lisinopril",
      strength: "10mg",
      dosage: "1 Tablet",
      route: "Oral",
      frequency: "Once daily (OD)",
      duration: "30 days",
      quantity: 30,
      instructions: "Take in the morning with or without food."
    }
  ]);

  const [primaryDiagnosis, setPrimaryDiagnosis] = useState("Essential Hypertension (I10)");
  const [secondaryDiagnosis, setSecondaryDiagnosis] = useState("Mild Bronchospasm");
  const [clinicalNotes, setClinicalNotes] = useState("Patient blood pressure checked at 138/88 mmHg. Continue lifestyle modification and monitor weekly.");
  const [preferredPharmacy, setPreferredPharmacy] = useState("Nairobi Central Pharmacy (CBD)");

  const handleAddMedication = () => {
    const newMed: MedicationItem = {
      id: `med-${Date.now()}`,
      drugName: "",
      genericName: "",
      strength: "",
      dosage: "1 Tablet",
      route: "Oral",
      frequency: "Twice daily (BD)",
      duration: "7 days",
      quantity: 14,
      instructions: "Take with meals."
    };
    setMedications([...medications, newMed]);
  };

  const handleRemoveMedication = (id: string) => {
    if (medications.length === 1) {
      alert("Prescription must contain at least one medication.");
      return;
    }
    setMedications(medications.filter(m => m.id !== id));
  };

  const handleUpdateMedication = (id: string, field: keyof MedicationItem, value: any) => {
    setMedications(medications.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleSubmitPrescription = (actionType: string) => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSuccessMessage(`Prescription successfully ${actionType} and sent to pharmacy!`);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-32">
      
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link
              href="/doctors/prescriptions"
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft size={16} /> Back
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">Create e-Prescription</h1>
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold rounded-full flex items-center gap-1">
                  <ShieldCheck size={11} /> Secure Digital Signature
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                Draft tamper-proof prescriptions with automated clinical safety checks and pharmacy sync.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              onClick={() => handleSubmitPrescription("saved as draft")}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Save Draft
            </button>
            <button
              onClick={() => handleSubmitPrescription("sent to pharmacy")}
              disabled={submitting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-md shadow-blue-600/20 transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <Send size={15} /> {submitting ? "Processing..." : "Send to Pharmacy"}
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
            <Link href="/doctors/prescriptions" className="underline font-black">Return to Prescriptions</Link>
          </div>
        </div>
      )}

      {/* ================= MAIN CONTAINER ================= */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT / CENTER: MEDICATION BUILDER & DIAGNOSIS (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* PATIENT SUMMARY CARD */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <User size={18} className="text-blue-600" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Patient Profile & Safety Context</h3>
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">{patient.name}</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Age / Gender</span>
                <p className="font-black text-slate-900">{patient.age} yrs • {patient.gender}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Weight</span>
                <p className="font-black text-slate-900">{patient.weight}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-2xl border border-red-200 space-y-1">
                <span className="text-[10px] font-bold text-red-600 uppercase">Allergies</span>
                <p className="font-black text-red-700">{patient.allergies.join(", ")}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Chronic Conditions</span>
                <p className="font-black text-slate-900">{patient.chronicConditions.join(", ")}</p>
              </div>
            </div>
          </div>

          {/* MEDICATIONS BUILDER */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Pill size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Medication Requisitions</h3>
                  <p className="text-xs text-slate-400">Add multiple medications to this prescription order.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddMedication}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={15} /> Add Another Medication
              </button>
            </div>

            <div className="space-y-6">
              {medications.map((med, idx) => (
                <div key={med.id} className="p-5 bg-slate-50 rounded-3xl border border-slate-200 space-y-4 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-blue-600">Medication Item #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMedication(med.id)}
                      className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition cursor-pointer"
                      title="Remove Medication"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Drug Name & Strength</label>
                      <div className="relative">
                        <Search size={14} className="absolute left-3.5 top-3 text-slate-400" />
                        <input
                          type="text"
                          placeholder="e.g., Lisinopril 10mg Tablet"
                          value={med.drugName}
                          onChange={(e) => handleUpdateMedication(med.id, "drugName", e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Route of Administration</label>
                      <select
                        value={med.route}
                        onChange={(e) => handleUpdateMedication(med.id, "route", e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                      >
                        <option value="Oral">Oral (PO)</option>
                        <option value="Intravenous (IV)">Intravenous (IV)</option>
                        <option value="Intramuscular (IM)">Intramuscular (IM)</option>
                        <option value="Topical">Topical</option>
                        <option value="Inhalation">Inhalation</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Frequency</label>
                      <select
                        value={med.frequency}
                        onChange={(e) => handleUpdateMedication(med.id, "frequency", e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                      >
                        <option value="Once daily (OD)">Once daily (OD)</option>
                        <option value="Twice daily (BD)">Twice daily (BD)</option>
                        <option value="Three times daily (TDS)">Three times daily (TDS)</option>
                        <option value="Four times daily (QDS)">Four times daily (QDS)</option>
                        <option value="As needed (PRN)">As needed (PRN)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Duration</label>
                        <input
                          type="text"
                          value={med.duration}
                          onChange={(e) => handleUpdateMedication(med.id, "duration", e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Quantity</label>
                        <input
                          type="number"
                          value={med.quantity}
                          onChange={(e) => handleUpdateMedication(med.id, "quantity", Number(e.target.value))}
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Special Patient Instructions</label>
                    <input
                      type="text"
                      value={med.instructions}
                      onChange={(e) => handleUpdateMedication(med.id, "instructions", e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DIAGNOSIS & CLINICAL NOTES */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
              Diagnosis & Clinical Justification
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Primary Diagnosis</label>
                <input
                  type="text"
                  value={primaryDiagnosis}
                  onChange={(e) => setPrimaryDiagnosis(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Secondary Diagnosis</label>
                <input
                  type="text"
                  value={secondaryDiagnosis}
                  onChange={(e) => setSecondaryDiagnosis(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Clinical Notes</label>
              <textarea
                rows={3}
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 resize-none"
              />
            </div>
          </div>

        </div>

        {/* RIGHT SIDEBAR: AI SAFETY PANEL & PHARMACY SELECTION (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* AI SAFETY PANEL */}
          <div className="bg-gradient-to-br from-blue-900 via-slate-900 to-slate-900 rounded-3xl border border-blue-500/30 p-6 text-white space-y-4 shadow-xl">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <div className="p-2 bg-blue-600 text-white rounded-xl">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider">Swift MD AI Safety Guard</h3>
                <p className="text-[10px] text-blue-400 font-bold">Real-time Clinical Validation</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-black text-emerald-400 uppercase">Allergy Conflict Check</span>
                <p className="text-slate-300">No known conflicts detected with patient allergy profile (Penicillin, Sulfa).</p>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-black text-emerald-400 uppercase">Drug Interaction Analysis</span>
                <p className="text-slate-300">Safe combination. Lisinopril does not interact adversely with current Salbutamol inhaler.</p>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-black text-amber-400 uppercase">Renal Dosing Reminder</span>
                <p className="text-slate-300">Patient eGFR within normal limits. Standard adult dosing appropriate.</p>
              </div>
            </div>
          </div>

          {/* PHARMACY SELECTION */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
              Pharmacy Dispatch
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Preferred Accredited Pharmacy</label>
              <select
                value={preferredPharmacy}
                onChange={(e) => setPreferredPharmacy(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              >
                <option value="Nairobi Central Pharmacy (CBD)">Nairobi Central Pharmacy (CBD)</option>
                <option value="Goodlife Pharmacy - Westlands">Goodlife Pharmacy - Westlands</option>
                <option value="Express Pharmacy - Kilimani">Express Pharmacy - Kilimani</option>
                <option value="Afya MediChem Pharmacy">Afya MediChem Pharmacy</option>
              </select>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => alert("Generating printable PDF prescription...")}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer size={15} /> Print Physical Prescription
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}