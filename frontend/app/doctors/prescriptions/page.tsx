// frontend/app/doctors/prescriptions/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Pill,
  Search,
  ShieldCheck,
  Plus,
  Filter,
  Download,
  Printer,
  Share2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight,
  User,
  Calendar,
  FileText,
  Send,
  RefreshCw,
  QrCode,
  X,
  Lock,
  Sparkles,
  ExternalLink,
  Check,
  Activity,
  Trash2
} from "lucide-react";

interface Prescription {
  id: string;
  patientName: string;
  patientAvatar: string;
  age: number;
  gender: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  route: string;
  duration: string;
  quantity: number;
  refills: number;
  status: "Draft" | "Sent" | "Dispensed" | "Completed" | "Expired";
  prescribedDate: string;
  pharmacyStatus: "Pending Dispense" | "Dispensed at Nairobi Pharmacy" | "Ready for Pickup";
  clinicalNotes: string;
  instructions: string;
  allergies: string[];
  currentMedications: string[];
  controlled: boolean;
}

export default function DoctorPrescriptionsPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState<string>("all");
  const [selectedRxId, setSelectedRxId] = useState<string>("rx-1");
  const [showNewRxModal, setShowNewRxModal] = useState<boolean>(false);
  const [showPatientPanel, setShowPatientPanel] = useState<boolean>(true);

  // New Prescription Form State
  const [medSearch, setMedSearch] = useState("Metformin 500mg Tablet");
  const [dosage, setDosage] = useState("500mg");
  const [frequency, setFrequency] = useState("Twice daily (BD)");
  const [route, setRoute] = useState("Oral");
  const [duration, setDuration] = useState("30 days");
  const [quantity, setQuantity] = useState(60);
  const [refillsCount, setRefillsCount] = useState(2);
  const [instructions, setInstructions] = useState("Take with meals to minimize gastrointestinal upset.");
  const [submittingRx, setSubmittingRx] = useState<boolean>(false);

  // Mock Realistic Prescriptions Data
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([
    {
      id: "rx-1",
      patientName: "Sarah Wanjiku",
      patientAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
      age: 32,
      gender: "Female",
      medicationName: "Lisinopril 10mg Tablet",
      dosage: "10mg",
      frequency: "Once daily (OD)",
      route: "Oral",
      duration: "30 days",
      quantity: 30,
      refills: 3,
      status: "Sent",
      prescribedDate: "Today, 09:15 AM",
      pharmacyStatus: "Ready for Pickup",
      clinicalNotes: "Hypertension management, monitor BP weekly.",
      instructions: "Take in the morning with or without food.",
      allergies: ["Penicillin", "Sulfa drugs"],
      currentMedications: ["Salbutamol Inhaler"],
      controlled: false
    },
    {
      id: "rx-2",
      patientName: "Brian Kip Korir",
      patientAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
      age: 45,
      gender: "Male",
      medicationName: "Metformin 850mg Extended Release",
      dosage: "850mg",
      frequency: "Twice daily (BD)",
      route: "Oral",
      duration: "60 days",
      quantity: 120,
      refills: 5,
      status: "Dispensed",
      prescribedDate: "Yesterday",
      pharmacyStatus: "Dispensed at Nairobi Pharmacy",
      clinicalNotes: "Type 2 Diabetes Mellitus glycemic control.",
      instructions: "Take with breakfast and dinner.",
      allergies: ["None known"],
      currentMedications: ["Metformin 500mg"],
      controlled: false
    },
    {
      id: "rx-3",
      patientName: "Amina Juma",
      patientAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200",
      age: 28,
      gender: "Female",
      medicationName: "Amoxicillin 500mg Capsule",
      dosage: "500mg",
      frequency: "Three times daily (TDS)",
      route: "Oral",
      duration: "7 days",
      quantity: 21,
      refills: 0,
      status: "Draft",
      prescribedDate: "Today, 11:30 AM",
      pharmacyStatus: "Pending Dispense",
      clinicalNotes: "Acute tonsillitis treatment.",
      instructions: "Complete full 7-day course even if symptoms improve.",
      allergies: ["Aspirin"],
      currentMedications: ["Paracetamol"],
      controlled: false
    }
  ]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const activeRx = prescriptions.find((r) => r.id === selectedRxId) || prescriptions[0];

  const handleCreatePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingRx(true);
    setTimeout(() => {
      const newRx: Prescription = {
        id: `rx-${Date.now()}`,
        patientName: "Grace Nyambura",
        patientAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
        age: 36,
        gender: "Female",
        medicationName: medSearch,
        dosage: dosage,
        frequency: frequency,
        route: route,
        duration: duration,
        quantity: quantity,
        refills: refillsCount,
        status: "Sent",
        prescribedDate: "Just now",
        pharmacyStatus: "Ready for Pickup",
        clinicalNotes: "E-prescription issued securely via Swift MD.",
        instructions: instructions,
        allergies: ["Latex"],
        currentMedications: ["None"],
        controlled: false
      };
      setPrescriptions([newRx, ...prescriptions]);
      setSubmittingRx(false);
      setShowNewRxModal(false);
    }, 600);
  };

  const filteredPrescriptions = prescriptions.filter((r) => {
    const matchesSearch = r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || r.medicationName.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (selectedTab === "active") return r.status === "Sent" || r.status === "Dispensed";
    if (selectedTab === "draft") return r.status === "Draft";
    if (selectedTab === "dispensed") return r.status === "Dispensed";
    if (selectedTab === "expired") return r.status === "Expired";
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500">Loading Swift MD E-Prescription Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-32">
      
      {/* ================= STICKY PAGE HEADER ================= */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">E-Prescriptions</h1>
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold rounded-full flex items-center gap-1">
                <ShieldCheck size={11} /> Secure Digital Signature Verified
              </span>
            </div>
            <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
              Issue tamper-proof electronic prescriptions, manage refills, and sync with accredited pharmacies.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search size={14} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search prescriptions or patients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>

            <button
              onClick={() => setShowNewRxModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-md shadow-blue-600/20 transition flex items-center gap-2 cursor-pointer"
            >
              <Plus size={16} />
              <span>Create New Prescription</span>
            </button>
          </div>
        </div>
      </header>

      {/* ================= MAIN CONTAINER ================= */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 space-y-6">

        {/* ================= STATS CARDS ================= */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Prescriptions Today", value: "18", sub: "+4 vs yesterday", icon: Pill, color: "text-blue-600 bg-blue-50" },
            { label: "Active Prescriptions", value: prescriptions.filter(r => r.status === "Sent" || r.status === "Dispensed").length, sub: "In treatment", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
            { label: "Refills Pending", value: "5", sub: "Awaiting approval", icon: RefreshCw, color: "text-amber-600 bg-amber-50" },
            { label: "Expiring Soon", value: "2", sub: "Next 48 hours", icon: Clock, color: "text-purple-600 bg-purple-50" },
            { label: "Controlled Alerts", value: "0", sub: "Fully verified", icon: ShieldCheck, color: "text-indigo-600 bg-indigo-50" }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-2xl ${item.color}`}>
                    <Icon size={16} />
                  </div>
                  <span className="text-[10px] font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {item.sub}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">{item.value}</h3>
                  <p className="text-[11px] font-bold text-slate-500">{item.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ================= FILTER TABS ================= */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {[
            { id: "all", label: "All Prescriptions" },
            { id: "active", label: "Active & Sent" },
            { id: "draft", label: "Drafts" },
            { id: "dispensed", label: "Dispensed" },
            { id: "expired", label: "Expired" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedTab === tab.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ================= TWO-COLUMN LAYOUT ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: PRESCRIPTIONS LIST TABLE (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Issued Prescriptions & Refills</h3>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                {filteredPrescriptions.length} records
              </span>
            </div>

            <div className="divide-y divide-slate-100 overflow-x-auto">
              {filteredPrescriptions.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                    <Pill size={24} />
                  </div>
                  <h4 className="text-xs font-bold text-slate-700">No prescriptions match current filter</h4>
                </div>
              ) : (
                filteredPrescriptions.map((rx) => {
                  const isSelected = rx.id === selectedRxId;
                  return (
                    <div
                      key={rx.id}
                      onClick={() => setSelectedRxId(rx.id)}
                      className={`p-4 transition cursor-pointer flex items-center justify-between gap-4 ${
                        isSelected ? "bg-blue-50/70 border-l-4 border-blue-600" : "hover:bg-slate-50/70"
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img src={rx.patientAvatar} alt={rx.patientName} className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0" />
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-black text-slate-900 truncate">{rx.patientName}</h4>
                            <span className="text-[10px] text-slate-400">({rx.gender}, {rx.age})</span>
                          </div>
                          <p className="text-xs font-bold text-blue-600 truncate">{rx.medicationName} ({rx.dosage})</p>
                          <p className="text-[10px] text-slate-400">{rx.frequency} • {rx.duration}</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        {rx.status === "Sent" && (
                          <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-extrabold rounded-full">
                            Sent
                          </span>
                        )}
                        {rx.status === "Dispensed" && (
                          <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold rounded-full border border-emerald-200">
                            Dispensed
                          </span>
                        )}
                        {rx.status === "Draft" && (
                          <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-extrabold rounded-full">
                            Draft
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-slate-400">{rx.pharmacyStatus}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT: PRESCRIPTION VIEWER & PATIENT PANEL (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Professional Printable Prescription Layout Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6 relative overflow-hidden">
              <div className="absolute right-4 top-4 text-slate-200 opacity-50">
                <QrCode size={64} />
              </div>

              <div className="border-b border-slate-100 pb-4 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-black rounded">SWIFT MD RX</span>
                  <span className="text-[10px] font-extrabold text-emerald-600">Digital Signature Valid</span>
                </div>
                <h3 className="text-base font-black text-slate-900">{activeRx.medicationName}</h3>
                <p className="text-xs text-slate-500">Patient: <strong className="text-slate-900">{activeRx.patientName}</strong></p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Dosage & Route</span>
                  <p className="font-black text-slate-900">{activeRx.dosage} • {activeRx.route}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Frequency</span>
                  <p className="font-black text-slate-900">{activeRx.frequency}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Duration & Qty</span>
                  <p className="font-black text-slate-900">{activeRx.duration} ({activeRx.quantity} units)</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Refills Allowed</span>
                  <p className="font-black text-blue-600">{activeRx.refills} Refills</p>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-1.5 bg-blue-50/50 p-3.5 rounded-2xl border border-blue-100">
                <span className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider">Patient Instructions</span>
                <p className="text-xs text-slate-800 font-medium">{activeRx.instructions}</p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => alert("Downloading prescription PDF with QR code...")}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-blue-600 text-white font-black text-xs rounded-xl shadow transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download size={14} /> Download PDF
                </button>
                <button
                  onClick={() => alert("Prescription shared securely with patient and pharmacy.")}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
                  title="Share Securely"
                >
                  <Share2 size={16} />
                </button>
              </div>
            </div>

            {/* Patient Context Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Patient Safety Profile</h4>
                <span className="text-xs text-blue-600 font-bold">{activeRx.patientName}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-extrabold text-red-600 uppercase tracking-wider">Allergies</span>
                  <p className="text-xs font-bold text-slate-900">{activeRx.allergies.join(", ")}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">Current Rx</span>
                  <p className="text-xs font-bold text-slate-900">{activeRx.currentMedications.join(", ")}</p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ================= CREATE PRESCRIPTION MODAL ================= */}
      {showNewRxModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-6 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Pill size={18} />
                </div>
                <h3 className="text-base font-black text-slate-900">Create E-Prescription</h3>
              </div>
              <button onClick={() => setShowNewRxModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePrescription} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Medication Name (Generic / Brand)</label>
                <input
                  type="text"
                  value={medSearch}
                  onChange={(e) => setMedSearch(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Dosage</label>
                  <input
                    type="text"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Route</label>
                  <select
                    value={route}
                    onChange={(e) => setRoute(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  >
                    <option value="Oral">Oral</option>
                    <option value="Intravenous (IV)">Intravenous (IV)</option>
                    <option value="Intramuscular (IM)">Intramuscular (IM)</option>
                    <option value="Topical">Topical</option>
                    <option value="Inhalation">Inhalation</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                >
                  <option value="Once daily (OD)">Once daily (OD)</option>
                  <option value="Twice daily (BD)">Twice daily (BD)</option>
                  <option value="Three times daily (TDS)">Three times daily (TDS)</option>
                  <option value="Four times daily (QDS)">Four times daily (QDS)</option>
                  <option value="As needed (PRN)">As needed (PRN)</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Refills</label>
                  <input
                    type="number"
                    value={refillsCount}
                    onChange={(e) => setRefillsCount(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Patient Instructions</label>
                <textarea
                  rows={2}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewRxModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRx}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-md shadow-blue-600/20 transition cursor-pointer disabled:opacity-50"
                >
                  {submittingRx ? "Signing & Sending..." : "Sign & Send Prescription"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}