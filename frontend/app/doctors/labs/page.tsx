// frontend/app/doctors/labs/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
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
  TrendingUp,
  User,
  Calendar,
  Pill,
  Send,
  MessageSquare,
  Video,
  ExternalLink,
  X,
  Lock,
  Sparkles,
  Activity,
  Check,
  Stethoscope
} from "lucide-react";

interface LabRequest {
  id: string;
  patientName: string;
  patientAvatar: string;
  age: number;
  gender: string;
  testName: string;
  category: string;
  priority: "Routine" | "Urgent" | "STAT";
  status: "Ordered" | "Sample Collected" | "Processing" | "Ready" | "Reviewed" | "Critical";
  doctor: string;
  requestedDate: string;
  completionTime: string;
  results?: {
    parameter: string;
    value: string;
    unit: string;
    referenceRange: string;
    flag: "normal" | "high" | "low" | "critical";
  }[];
  clinicalIndication: string;
  allergies: string[];
  medications: string[];
}

export default function DoctorLabsPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState<string>("all");
  const [selectedLabId, setSelectedLabId] = useState<string>("lab-1");
  const [showOrderModal, setShowOrderModal] = useState<boolean>(false);
  const [showPatientPanel, setShowPatientPanel] = useState<boolean>(true);

  // New Lab Order Form State
  const [newTestCategory, setNewTestCategory] = useState("Hematology");
  const [newTestName, setNewTestName] = useState("Complete Blood Count (CBC)");
  const [newPriority, setNewPriority] = useState<"Routine" | "Urgent" | "STAT">("Routine");
  const [newClinicalIndication, setNewClinicalIndication] = useState("");
  const [submittingOrder, setSubmittingOrder] = useState<boolean>(false);

  // Mock Realistic Lab Data
  const [labs, setLabs] = useState<LabRequest[]>([
    {
      id: "lab-1",
      patientName: "Sarah Wanjiku",
      patientAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
      age: 32,
      gender: "Female",
      testName: "Lipid Profile & HbA1c",
      category: "Biochemistry",
      priority: "STAT",
      status: "Critical",
      doctor: "Dr. William Mugwe",
      requestedDate: "Today, 08:30 AM",
      completionTime: "Ready (10m ago)",
      clinicalIndication: "Persistent fatigue and suspected metabolic syndrome screening.",
      allergies: ["Penicillin", "Sulfa drugs"],
      medications: ["Lisinopril 10mg"],
      results: [
        { parameter: "Total Cholesterol", value: "6.8", unit: "mmol/L", referenceRange: "< 5.2", flag: "high" },
        { parameter: "Triglycerides", value: "2.4", unit: "mmol/L", referenceRange: "< 1.7", flag: "high" },
        { parameter: "HbA1c", value: "8.2", unit: "%", referenceRange: "< 5.7", flag: "critical" },
        { parameter: "HDL Cholesterol", value: "0.9", unit: "mmol/L", referenceRange: "> 1.0", flag: "low" }
      ]
    },
    {
      id: "lab-2",
      patientName: "Brian Kip Korir",
      patientAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
      age: 45,
      gender: "Male",
      testName: "Complete Blood Count (CBC)",
      category: "Hematology",
      priority: "Urgent",
      status: "Ready",
      doctor: "Dr. William Mugwe",
      requestedDate: "Yesterday",
      completionTime: "Yesterday, 04:15 PM",
      clinicalIndication: "Fever evaluation and leukocytosis check.",
      allergies: ["None known"],
      medications: ["Metformin 500mg"],
      results: [
        { parameter: "Hemoglobin", value: "14.2", unit: "g/dL", referenceRange: "13.5 - 17.5", flag: "normal" },
        { parameter: "White Blood Cells", value: "11.8", unit: "x10^9/L", referenceRange: "4.5 - 11.0", flag: "high" },
        { parameter: "Platelets", value: "250", unit: "x10^9/L", referenceRange: "150 - 450", flag: "normal" }
      ]
    },
    {
      id: "lab-3",
      patientName: "Amina Juma",
      patientAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200",
      age: 28,
      gender: "Female",
      testName: "Malaria Blood Smear (RDT / Microscopy)",
      category: "Parasitology",
      priority: "Routine",
      status: "Processing",
      doctor: "Dr. William Mugwe",
      requestedDate: "Today, 09:10 AM",
      completionTime: "Est. 30 mins",
      clinicalIndication: "Intermittent chills and headache.",
      allergies: ["Aspirin"],
      medications: ["Paracetamol"],
      results: []
    }
  ]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const activeLab = labs.find((l) => l.id === selectedLabId) || labs[0];

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingOrder(true);
    setTimeout(() => {
      const newReq: LabRequest = {
        id: `lab-${Date.now()}`,
        patientName: "Grace Nyambura",
        patientAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
        age: 36,
        gender: "Female",
        testName: newTestName,
        category: newTestCategory,
        priority: newPriority,
        status: "Ordered",
        doctor: "Dr. William Mugwe",
        requestedDate: "Just now",
        completionTime: "Est. 2 hours",
        clinicalIndication: newClinicalIndication || "Routine diagnostic evaluation.",
        allergies: ["Latex"],
        medications: ["None"],
        results: []
      };
      setLabs([newReq, ...labs]);
      setSubmittingOrder(false);
      setShowOrderModal(false);
      setNewClinicalIndication("");
    }, 600);
  };

  const filteredLabs = labs.filter((l) => {
    const matchesSearch = l.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || l.testName.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (selectedTab === "pending") return l.status === "Ordered" || l.status === "Sample Collected";
    if (selectedTab === "processing") return l.status === "Processing";
    if (selectedTab === "ready") return l.status === "Ready";
    if (selectedTab === "critical") return l.status === "Critical";
    if (selectedTab === "reviewed") return l.status === "Reviewed";
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500">Loading Swift MD Laboratory Center...</p>
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
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Laboratory Center</h1>
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold rounded-full flex items-center gap-1">
                <ShieldCheck size={11} /> Live KMLTTB Sync Active
              </span>
            </div>
            <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
              Request diagnostic tests, monitor critical results, and review verified lab reports securely.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search size={14} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search tests or patients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>

            <button
              onClick={() => setShowOrderModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-md shadow-blue-600/20 transition flex items-center gap-2 cursor-pointer"
            >
              <Plus size={16} />
              <span>Order New Lab Test</span>
            </button>
          </div>
        </div>
      </header>

      {/* ================= MAIN CONTAINER ================= */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 space-y-6">

        {/* ================= STATS CARDS ================= */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Pending Tests", value: labs.filter(l => l.status === "Ordered" || l.status === "Processing").length, sub: "In progress", icon: Clock, color: "text-amber-600 bg-amber-50" },
            { label: "Results Ready", value: labs.filter(l => l.status === "Ready").length, sub: "Awaiting review", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
            { label: "Critical Results", value: labs.filter(l => l.status === "Critical").length, sub: "Action required", icon: AlertTriangle, color: "text-red-600 bg-red-50" },
            { label: "Tests Ordered Today", value: "14", sub: "+3 vs yesterday", icon: FileText, color: "text-blue-600 bg-blue-50" },
            { label: "Avg Turnaround", value: "2.4 hrs", sub: "Fast track", icon: Activity, color: "text-purple-600 bg-purple-50" }
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
            { id: "all", label: "All Requests" },
            { id: "pending", label: "Pending & Sample Collected" },
            { id: "processing", label: "Processing" },
            { id: "ready", label: "Results Ready" },
            { id: "critical", label: "⚠️ Critical Results" },
            { id: "reviewed", label: "Reviewed" }
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

        {/* ================= TWO-COLUMN DASHBOARD LAYOUT ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: LAB REQUESTS TABLE / LIST (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Laboratory Requisitions & Results</h3>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                {filteredLabs.length} records
              </span>
            </div>

            <div className="divide-y divide-slate-100 overflow-x-auto">
              {filteredLabs.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                    <FileText size={24} />
                  </div>
                  <h4 className="text-xs font-bold text-slate-700">No lab requests match current filter</h4>
                </div>
              ) : (
                filteredLabs.map((lab) => {
                  const isSelected = lab.id === selectedLabId;
                  return (
                    <div
                      key={lab.id}
                      onClick={() => setSelectedLabId(lab.id)}
                      className={`p-4 transition cursor-pointer flex items-center justify-between gap-4 ${
                        isSelected ? "bg-blue-50/70 border-l-4 border-blue-600" : "hover:bg-slate-50/70"
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img src={lab.patientAvatar} alt={lab.patientName} className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0" />
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-black text-slate-900 truncate">{lab.patientName}</h4>
                            <span className="text-[10px] text-slate-400">({lab.gender}, {lab.age})</span>
                          </div>
                          <p className="text-xs font-bold text-blue-600 truncate">{lab.testName}</p>
                          <p className="text-[10px] text-slate-400">{lab.category} • Requested {lab.requestedDate}</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        {lab.status === "Critical" && (
                          <span className="px-2.5 py-0.5 bg-red-50 text-red-600 text-[10px] font-extrabold rounded-full border border-red-200 flex items-center gap-1">
                            <AlertTriangle size={11} /> Critical
                          </span>
                        )}
                        {lab.status === "Ready" && (
                          <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold rounded-full border border-emerald-200">
                            Ready
                          </span>
                        )}
                        {lab.status === "Processing" && (
                          <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-extrabold rounded-full border border-amber-200">
                            Processing
                          </span>
                        )}
                        {lab.status === "Ordered" && (
                          <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-extrabold rounded-full">
                            Ordered
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-slate-400">{lab.priority}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT: LAB RESULTS VIEWER & PATIENT PANEL (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Selected Lab Details & Results Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-extrabold rounded-md">
                    {activeLab.category}
                  </span>
                  <h3 className="text-base font-black text-slate-900">{activeLab.testName}</h3>
                  <p className="text-xs text-slate-500">Patient: <strong className="text-slate-900">{activeLab.patientName}</strong></p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button onClick={() => alert("Downloading Lab PDF Report...")} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer" title="Download Report">
                    <Download size={14} />
                  </button>
                  <button onClick={() => alert("Sending report to patient...")} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer" title="Share with Patient">
                    <Share2 size={14} />
                  </button>
                </div>
              </div>

              {/* Clinical Indication */}
              <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Clinical Indication</span>
                <p className="text-xs text-slate-700 italic">{activeLab.clinicalIndication}</p>
              </div>

              {/* Results Breakdown Table if Available */}
              {activeLab.results && activeLab.results.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Verified Test Results</h4>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">KMLTTB Certified</span>
                  </div>

                  <div className="border border-slate-200 rounded-2xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase">
                          <th className="p-3">Parameter</th>
                          <th className="p-3">Value</th>
                          <th className="p-3">Reference</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs font-medium">
                        {activeLab.results.map((res, idx) => (
                          <tr key={idx} className={res.flag === "critical" || res.flag === "high" ? "bg-red-50/50" : ""}>
                            <td className="p-3 text-slate-900 font-bold">{res.parameter}</td>
                            <td className={`p-3 font-black ${
                              res.flag === "critical" ? "text-red-600 flex items-center gap-1" :
                              res.flag === "high" ? "text-amber-600" :
                              res.flag === "low" ? "text-blue-600" : "text-slate-900"
                            }`}>
                              {res.value} {res.unit}
                              {res.flag === "critical" && <AlertTriangle size={12} />}
                            </td>
                            <td className="p-3 text-slate-400 text-[11px]">{res.referenceRange}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Actions for Abnormal Results */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => alert(`Escalating critical result to telehealth consultation for ${activeLab.patientName}...`)}
                      className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl shadow transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Video size={14} /> Escalate to Video Consult
                    </button>
                    <button
                      onClick={() => alert(`Opening secure chat to discuss lab results with ${activeLab.patientName}...`)}
                      className="flex-1 py-2.5 bg-slate-900 hover:bg-blue-600 text-white font-black text-xs rounded-xl shadow transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <MessageSquare size={14} /> Message Patient
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <Clock size={24} className="mx-auto text-amber-500 animate-pulse" />
                  <h4 className="text-xs font-bold text-slate-700">Test currently processing</h4>
                  <p className="text-[11px] text-slate-400">Results will appear automatically once verified by the lab technologist.</p>
                </div>
              )}
            </div>

            {/* Patient Clinical Context Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Patient Summary</h4>
                <span className="text-xs text-blue-600 font-bold">{activeLab.patientName}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-extrabold text-red-600 uppercase tracking-wider">Allergies</span>
                  <p className="text-xs font-bold text-slate-900">{activeLab.allergies.join(", ")}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">Medications</span>
                  <p className="text-xs font-bold text-slate-900">{activeLab.medications.join(", ")}</p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ================= ORDER NEW LAB TEST MODAL ================= */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <FileText size={18} />
                </div>
                <h3 className="text-base font-black text-slate-900">Order New Laboratory Test</h3>
              </div>
              <button onClick={() => setShowOrderModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleOrderSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Test Category</label>
                <select
                  value={newTestCategory}
                  onChange={(e) => setNewTestCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                >
                  <option value="Hematology">Hematology (CBC, Blood Smear)</option>
                  <option value="Biochemistry">Biochemistry (Lipid Profile, Liver/Kidney Function)</option>
                  <option value="Parasitology">Parasitology (Malaria RDT/Microscopy)</option>
                  <option value="Serology">Serology (HIV, Hepatitis)</option>
                  <option value="Urinalysis">Urinalysis & Microbiology</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Select Test Panel</label>
                <select
                  value={newTestName}
                  onChange={(e) => setNewTestName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                >
                  <option value="Complete Blood Count (CBC)">Complete Blood Count (CBC)</option>
                  <option value="Lipid Profile & HbA1c">Lipid Profile & HbA1c</option>
                  <option value="Malaria Blood Smear">Malaria Blood Smear</option>
                  <option value="Liver Function Tests (LFTs)">Liver Function Tests (LFTs)</option>
                  <option value="Renal Function Tests (RFTs)">Renal Function Tests (RFTs)</option>
                  <option value="Random Blood Sugar (RBS)">Random Blood Sugar (RBS)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Priority Level</label>
                <div className="flex gap-2">
                  {(["Routine", "Urgent", "STAT"] as const).map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setNewPriority(p)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                        newPriority === p
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Clinical Indication & Notes</label>
                <textarea
                  rows={3}
                  placeholder="Enter clinical symptoms, diagnosis rationale..."
                  value={newClinicalIndication}
                  onChange={(e) => setNewClinicalIndication(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingOrder}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-md shadow-blue-600/20 transition cursor-pointer disabled:opacity-50"
                >
                  {submittingOrder ? "Submitting Order..." : "Confirm & Order Test"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}