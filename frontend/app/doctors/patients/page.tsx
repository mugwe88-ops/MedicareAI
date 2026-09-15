// frontend/app/doctors/dashboard/patients/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  AlertCircle,
  CalendarCheck,
  Activity,
  RefreshCw,
  Download,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Calendar,
  FileText,
  Video,
  ChevronRight,
  ShieldAlert,
  Clock,
  Heart,
  UserCheck,
  Stethoscope,
  X,
  FilePlus,
  Mic,
  Pin,
  CheckCircle2,
  Sparkles,
  Phone,
  Droplet,
  AlertTriangle,
  Pill,
  Building2,
  ChevronDown
} from "lucide-react";

// --- TYPES ---
interface Patient {
  id: string;
  name: string;
  patientId: string;
  age: number;
  gender: string;
  phone: string;
  status: "Stable" | "Under Observation" | "Critical" | "Unread Updates";
  lastVisit: string;
  primaryDiagnosis: string;
  latestVitals: {
    bp: string;
    hr: string;
    temp: string;
    spo2: string;
  };
  bloodGroup: string;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  prescription: string;
  notes?: string;
  isPinned?: boolean;
  isRecentlyViewed?: boolean;
}

interface TimelineEvent {
  id: string;
  date: string;
  type: "telehealth" | "lab" | "prescription" | "diagnosis" | "admission";
  title: string;
  description: string;
  doctor: string;
}

export default function PatientRecordsPage() {
  const router = useRouter();

  // --- STATE ---
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorState, setErrorState] = useState<"none" | "auth" | "server">("none");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"name" | "recent" | "status">("recent");
  
  // High-priority Drawer & Productivity state
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [pinnedIds, setPinnedIds] = useState<string[]>(["P-1001", "P-1002"]);
  const [recentIds, setRecentIds] = useState<string[]>(["P-1001"]);
  const [isVoiceRecording, setIsVoiceRecording] = useState<boolean>(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>("");

  // --- MOCK DATA FETCHING ---
  const fetchPatients = async () => {
    setLoading(true);
    setErrorState("none");
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
      
      // Simulating API call structure requested by user
      const res = await fetch("/api/doctors/patients", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        setErrorState("auth");
        setLoading(false);
        return;
      }

      // Fallback mock dataset demonstrating all rich fields requested
      const mockPatients: Patient[] = [
        {
          id: "1",
          name: "Eunice Wangari",
          patientId: "P-1001",
          age: 34,
          gender: "Female",
          phone: "+254 712 345 678",
          status: "Critical",
          lastVisit: "Today, 10:30 AM",
          primaryDiagnosis: "Acute Hypertensive Crisis",
          latestVitals: { bp: "185/110 mmHg", hr: "102 bpm", temp: "36.8°C", spo2: "94%" },
          bloodGroup: "O+",
          allergies: ["Penicillin", "Sulfa drugs"],
          chronicConditions: ["Hypertension", "Type 2 Diabetes"],
          currentMedications: ["Metformin 500mg", "Amlodipine 10mg"],
          emergencyContact: { name: "James Kamau", relation: "Spouse", phone: "+254 722 987 654" },
          prescription: "Lisinopril 20mg daily",
          isPinned: true
        },
        {
          id: "2",
          name: "Brian Kiprono",
          patientId: "P-1002",
          age: 28,
          gender: "Male",
          phone: "+254 733 112 233",
          status: "Under Observation",
          lastVisit: "Yesterday",
          primaryDiagnosis: "Community-Acquired Pneumonia",
          latestVitals: { bp: "125/80 mmHg", hr: "88 bpm", temp: "38.2°C", spo2: "96%" },
          bloodGroup: "A+",
          allergies: ["Aspirin"],
          chronicConditions: ["Asthma"],
          currentMedications: ["Salbutamol Inhaler", "Azithromycin 500mg"],
          emergencyContact: { name: "Sarah Kiprono", relation: "Sister", phone: "+254 733 445 566" },
          prescription: "Azithromycin 500mg OD x 5 days",
          isPinned: true
        },
        {
          id: "3",
          name: "Amina Abdi",
          patientId: "P-1003",
          age: 45,
          gender: "Female",
          phone: "+254 700 556 677",
          status: "Stable",
          lastVisit: "3 days ago",
          primaryDiagnosis: "Gestational Diabetes Follow-up",
          latestVitals: { bp: "118/76 mmHg", hr: "74 bpm", temp: "36.5°C", spo2: "99%" },
          bloodGroup: "B+",
          allergies: ["None known"],
          chronicConditions: ["Gestational Diabetes"],
          currentMedications: ["Insulin Regular", "Prenatal Vitamins"],
          emergencyContact: { name: "Mohamed Hassan", relation: "Brother", phone: "+254 701 112 233" },
          prescription: "Insulin sliding scale protocol",
        },
        {
          id: "4",
          name: "David Ochieng",
          patientId: "P-1004",
          age: 52,
          gender: "Male",
          phone: "+254 721 998 877",
          status: "Unread Updates",
          lastVisit: "4 days ago",
          primaryDiagnosis: "Chronic Lower Back Pain",
          latestVitals: { bp: "130/85 mmHg", hr: "78 bpm", temp: "36.6°C", spo2: "98%" },
          bloodGroup: "AB+",
          allergies: ["Latex"],
          chronicConditions: ["Lumbar Spondylosis"],
          currentMedications: ["Diclofenac Gel", "Paracetamol 1g"],
          emergencyContact: { name: "Beatrice Ochieng", relation: "Wife", phone: "+254 722 334 455" },
          prescription: "Physiotherapy referral & Ibuprofen 400mg PRN",
        },
        {
          id: "5",
          name: "Grace Muthoni",
          patientId: "P-1005",
          age: 61,
          gender: "Female",
          phone: "+254 718 223 344",
          status: "Stable",
          lastVisit: "1 week ago",
          primaryDiagnosis: "Primary Osteoarthritis",
          latestVitals: { bp: "140/90 mmHg", hr: "72 bpm", temp: "36.7°C", spo2: "97%" },
          bloodGroup: "O-",
          allergies: ["Codeine"],
          chronicConditions: ["Osteoarthritis", "Mild Hypertension"],
          currentMedications: ["Glucosamine Chondroitin", "Hydrochlorothiazide 25mg"],
          emergencyContact: { name: "Peter Mwangi", relation: "Son", phone: "+254 719 556 677" },
          prescription: "Calcium + Vitamin D3 supplements",
        }
      ];

      setPatients(mockPatients);
      setLoading(false);
    } catch (err) {
      setErrorState("server");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // --- STATS COMPUTATION ---
  const stats = useMemo(() => {
    const total = patients.length;
    const reviewRequired = patients.filter(p => p.status === "Critical" || p.status === "Unread Updates").length;
    const todayFollowUps = 3; // Mock scheduled active workload count
    const critical = patients.filter(p => p.status === "Critical").length;
    return { total, reviewRequired, todayFollowUps, critical };
  }, [patients]);

  // Status counts for chips
  const statusCounts = useMemo(() => {
    return {
      All: patients.length,
      Stable: patients.filter(p => p.status === "Stable").length,
      "Under Observation": patients.filter(p => p.status === "Under Observation").length,
      Critical: patients.filter(p => p.status === "Critical").length,
      "Unread Updates": patients.filter(p => p.status === "Unread Updates").length,
    };
  }, [patients]);

  // --- FILTER & SEARCH LOGIC ---
  const filteredPatients = useMemo(() => {
    return patients
      .filter((p) => {
        const matchesTab = selectedStatusTab === "All" || p.status === selectedStatusTab;
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          !query ||
          p.name.toLowerCase().includes(query) ||
          p.patientId.toLowerCase().includes(query) ||
          p.phone.toLowerCase().includes(query) ||
          p.primaryDiagnosis.toLowerCase().includes(query) ||
          p.prescription.toLowerCase().includes(query) ||
          p.chronicConditions.some(c => c.toLowerCase().includes(query));

        return matchesTab && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "status") return a.status.localeCompare(b.status);
        return 0; // Default recent
      });
  }, [patients, selectedStatusTab, searchQuery, sortBy]);

  // Pinned & Recent subset items
  const pinnedPatients = useMemo(() => patients.filter(p => pinnedIds.includes(p.patientId)), [patients, pinnedIds]);
  const recentPatients = useMemo(() => patients.filter(p => recentIds.includes(p.patientId)), [patients, recentIds]);

  const togglePin = (patientId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPinnedIds(prev => 
      prev.includes(patientId) ? prev.filter(id => id !== patientId) : [...prev, patientId]
    );
  };

  const handleOpenPatientDrawer = (patient: Patient) => {
    setSelectedPatient(patient);
    if (!recentIds.includes(patient.patientId)) {
      setRecentIds(prev => [patient.patientId, ...prev].slice(0, 5));
    }
  };

  // Mock Voice Recording simulator
  const toggleVoiceNote = () => {
    if (!isVoiceRecording) {
      setIsVoiceRecording(true);
      setVoiceTranscript("Listening... speak clinical notes...");
      setTimeout(() => {
        setVoiceTranscript("Patient reports subsiding occipital headache. Blood pressure responding well to adjusted Amlodipine dosage.");
        setIsVoiceRecording(false);
      }, 3500);
    } else {
      setIsVoiceRecording(false);
    }
  };

  // Timeline mock generator for the selected patient drawer
  const sampleTimeline: TimelineEvent[] = [
    {
      id: "t-1",
      date: "Today, 10:30 AM",
      type: "telehealth",
      title: "Telehealth Consultation Completed",
      description: "Reviewed acute blood pressure spikes. Adjusted daily medication regimen.",
      doctor: "Dr. Pressy Phides"
    },
    {
      id: "t-2",
      date: "Yesterday",
      type: "lab",
      title: "Comprehensive Metabolic Panel Released",
      description: "Serum creatinine within normal limits (1.0 mg/dL). Fasting blood glucose elevated at 7.2 mmol/L.",
      doctor: "Central Pathology Labs"
    },
    {
      id: "t-3",
      date: "3 days ago",
      type: "prescription",
      title: "Prescription Updated",
      description: "Renewed Amlodipine 10mg and added Metformin 500mg BID.",
      doctor: "Dr. Pressy Phides"
    },
    {
      id: "t-4",
      date: "Last month",
      type: "diagnosis",
      title: "Initial Assessment & Diagnostic Workup",
      description: "Diagnosed with Stage 2 Essential Hypertension.",
      doctor: "Dr. Pressy Phides"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 md:p-8 font-sans pb-24">
      {/* ================= 1. COMMAND CENTER HEADER ================= */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-600/30">
                <Users size={22} />
              </span>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Patient Records Command Center</h1>
            </div>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Real-time clinical workload management, vital tracking, and integrated care pathways.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchPatients}
              className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-sm transition cursor-pointer active:scale-95"
              title="Refresh Records"
            >
              <RefreshCw size={14} className={loading ? "animate-spin text-blue-600" : ""} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => alert("Exporting patient registry securely (CSV / PDF)...")}
              className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/30 transition cursor-pointer active:scale-95"
            >
              <Download size={14} />
              <span>Export Records</span>
            </button>
          </div>
        </div>

        {/* Live Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Patients</span>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">{stats.total}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Users size={20} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Requires Review</span>
              <h3 className="text-xl font-black text-amber-600 mt-0.5">{stats.reviewRequired}</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <AlertCircle size={20} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today's Follow-ups</span>
              <h3 className="text-xl font-black text-indigo-600 mt-0.5">{stats.todayFollowUps}</h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <CalendarCheck size={20} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Critical Patients</span>
              <h3 className="text-xl font-black text-rose-600 mt-0.5">{stats.critical}</h3>
            </div>
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
              <ShieldAlert size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* ================= 8. PRODUCTIVITY RIBBON ================= */}
      <div className="mb-6 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1 flex-shrink-0">
            <Pin size={13} className="text-blue-600" /> Pinned:
          </span>
          {pinnedPatients.map(p => (
            <button
              key={p.patientId}
              onClick={() => handleOpenPatientDrawer(p)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              {p.name}
            </button>
          ))}
          {pinnedPatients.length === 0 && <span className="text-xs text-slate-400 italic">No pinned patients</span>}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleVoiceNote}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition flex items-center gap-1.5 cursor-pointer ${
              isVoiceRecording 
                ? "bg-rose-600 text-white border-rose-600 animate-pulse" 
                : "bg-slate-900 text-white hover:bg-slate-800 border-slate-900"
            }`}
          >
            <Mic size={14} />
            <span>{isVoiceRecording ? "Recording Notes..." : "Voice-to-Clinical-Notes"}</span>
          </button>
        </div>
      </div>

      {/* Voice Transcript banner if active */}
      {voiceTranscript && (
        <div className="mb-6 p-3.5 bg-blue-900 text-blue-50 rounded-2xl shadow-lg flex items-center justify-between gap-3 text-xs font-medium">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400 animate-spin" />
            <span><strong>AI Transcription Note:</strong> {voiceTranscript}</span>
          </div>
          <button onClick={() => setVoiceTranscript("")} className="text-blue-200 hover:text-white">
            <X size={16} />
          </button>
        </div>
      )}

      {/* ================= 2. PROFESSIONAL ERROR STATE ================= */}
      {errorState === "auth" && (
        <div className="my-12 p-8 bg-white rounded-3xl border border-rose-200 shadow-xl text-center max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-lg text-slate-900">Couldn't load patient records</h3>
            <p className="text-xs text-slate-500">Your session may have expired.</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => router.push("/login")}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/30 transition cursor-pointer"
            >
              Sign In Again
            </button>
            <button
              onClick={fetchPatients}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {errorState === "server" && (
        <div className="my-12 p-8 bg-white rounded-3xl border border-amber-200 shadow-xl text-center max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <AlertTriangle size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-lg text-slate-900">Connection Interrupted</h3>
            <p className="text-xs text-slate-500">Unable to establish secure link with clinical records database.</p>
          </div>
          <button
            onClick={fetchPatients}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/30 transition cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* ================= 3. UPGRADED SEARCH & FILTER BAR ================= */}
      {errorState === "none" && (
        <>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-5 space-y-4">
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              {/* Universal Search */}
              <div className="relative flex-1 w-full">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by patient name, ID, phone number, diagnosis, prescription, or medical condition..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                />
              </div>

              {/* Filters & Sorting controls */}
              <div className="flex items-center gap-2.5 w-full md:w-auto">
                <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
                  <ArrowUpDown size={14} className="text-slate-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent focus:outline-none cursor-pointer"
                  >
                    <option value="recent">Sort: Most Recent</option>
                    <option value="name">Sort: Name (A-Z)</option>
                    <option value="status">Sort: Status Priority</option>
                  </select>
                </div>

                <button
                  onClick={() => alert("Advanced Date & Diagnostic Range filter panel")}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition cursor-pointer"
                >
                  <SlidersHorizontal size={14} className="text-slate-400" />
                  <span>Date Range</span>
                </button>
              </div>
            </div>

            {/* Status Chips with Patient Counts */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
              {[
                { label: "All", count: statusCounts.All },
                { label: "Stable", count: statusCounts.Stable },
                { label: "Under Observation", count: statusCounts["Under Observation"] },
                { label: "Critical", count: statusCounts.Critical },
                { label: "Unread Updates", count: statusCounts["Unread Updates"] },
              ].map((tab) => (
                <button
                  key={tab.label}
                  onClick={() => setSelectedStatusTab(tab.label)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
                    selectedStatusTab === tab.label
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                    selectedStatusTab === tab.label ? "bg-blue-700 text-white" : "bg-slate-200 text-slate-700"
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ================= 4. PATIENT CARDS LIST ================= */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="w-32 h-4 bg-slate-200 rounded" />
                    <div className="w-16 h-5 bg-slate-200 rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-3 bg-slate-200 rounded" />
                    <div className="w-3/4 h-3 bg-slate-200 rounded" />
                  </div>
                  <div className="pt-4 border-t border-slate-100 flex justify-between">
                    <div className="w-20 h-7 bg-slate-200 rounded-xl" />
                    <div className="w-20 h-7 bg-slate-200 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPatients.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPatients.map((patient) => {
                const isPinned = pinnedIds.includes(patient.patientId);
                return (
                  <div
                    key={patient.id}
                    onClick={() => handleOpenPatientDrawer(patient)}
                    className="group bg-white hover:border-blue-300 p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between relative overflow-hidden"
                  >
                    {/* Top status & pin indicator */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900 group-hover:text-blue-600 transition">
                            {patient.name}
                          </span>
                          <span className="text-[11px] font-bold text-slate-400">({patient.patientId})</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => togglePin(patient.patientId, e)}
                            className={`p-1.5 rounded-lg transition ${
                              isPinned ? "text-blue-600 bg-blue-50" : "text-slate-300 hover:text-slate-600"
                            }`}
                            title={isPinned ? "Unpin Patient" : "Pin Patient"}
                          >
                            <Pin size={14} className={isPinned ? "fill-current" : ""} />
                          </button>

                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            patient.status === "Critical" 
                              ? "bg-rose-50 text-rose-600 border border-rose-200 animate-pulse"
                              : patient.status === "Under Observation"
                              ? "bg-amber-50 text-amber-600 border border-amber-200"
                              : patient.status === "Unread Updates"
                              ? "bg-indigo-50 text-indigo-600 border border-indigo-200"
                              : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                          }`}>
                            {patient.status}
                          </span>
                        </div>
                      </div>

                      {/* Patient metadata & vital snippet */}
                      <div className="space-y-2 text-xs text-slate-600">
                        <div className="flex items-center justify-between font-medium">
                          <span className="text-slate-500">Age & Gender:</span>
                          <span className="font-bold text-slate-800">{patient.age} yrs • {patient.gender}</span>
                        </div>

                        <div className="flex items-center justify-between font-medium">
                          <span className="text-slate-500">Primary Diagnosis:</span>
                          <span className="font-bold text-slate-800 truncate max-w-[180px]">{patient.primaryDiagnosis}</span>
                        </div>

                        <div className="flex items-center justify-between font-medium">
                          <span className="text-slate-500">Last Visit:</span>
                          <span className="font-semibold text-slate-700">{patient.lastVisit}</span>
                        </div>

                        {/* Vital sign highlight badge */}
                        <div className="mt-2.5 p-2.5 bg-slate-50 group-hover:bg-blue-50/50 rounded-2xl border border-slate-100 flex items-center justify-between transition">
                          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                            <Activity size={13} className="text-blue-600" /> BP:
                          </span>
                          <span className="text-xs font-black text-slate-900">{patient.latestVitals.bp}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Action buttons */}
                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-1.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpenPatientDrawer(patient); }}
                        className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-[11px] font-bold rounded-xl transition text-center"
                      >
                        Open Profile
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); router.push(`/doctors/dashboard/telehealth/${patient.id}`); }}
                        className="p-1.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 rounded-xl transition"
                        title="Start Telehealth Consultation"
                      >
                        <Video size={16} />
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpenPatientDrawer(patient); }}
                        className="p-1.5 bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 rounded-xl transition"
                        title="Write Prescription"
                      >
                        <Pill size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ================= 7. BETTER EMPTY STATE ================= */
            <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center max-w-lg mx-auto space-y-4 my-8">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <Users size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-lg text-slate-900">No patients assigned yet</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Assigned patients will appear here after they book an appointment or are linked to your account.
                </p>
              </div>
              <button
                onClick={() => router.push("/doctors/dashboard/appointments")}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/30 transition cursor-pointer"
              >
                View Appointments
              </button>
            </div>
          )}
        </>
      )}

      {/* ================= 5, 6, 10. PATIENT SNAPSHOT DRAWER & TIMELINE ================= */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col overflow-y-auto animate-in slide-in-from-right duration-300">
            
            {/* Drawer Header */}
            <div className="p-6 bg-slate-950 text-white flex items-center justify-between sticky top-0 z-10 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md">
                  {selectedPatient.name.charAt(0)}
                </div>
                <div>
                  <h2 className="font-black text-base text-white">{selectedPatient.name}</h2>
                  <p className="text-xs text-blue-300 font-medium">{selectedPatient.patientId} • {selectedPatient.age} yrs, {selectedPatient.gender}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedPatient(null)}
                className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Action Toolbar inside drawer */}
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center gap-2">
              <button
                onClick={() => router.push(`/doctors/dashboard/telehealth/${selectedPatient.id}`)}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Video size={14} /> Start Video Consultation
              </button>

              <button
                onClick={() => alert(`Writing prescription for ${selectedPatient.name}...`)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-blue-300 hover:text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Pill size={14} /> Write Prescription
              </button>

              <button
                onClick={() => alert(`Adding clinical notes for ${selectedPatient.name}...`)}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl transition cursor-pointer"
                title="Add Notes"
              >
                <FilePlus size={14} />
              </button>
            </div>

            {/* Drawer Body Details */}
            <div className="p-6 space-y-6 flex-1">
              
              {/* Critical Alerts / Allergies banner */}
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                  <AlertTriangle size={14} /> Critical Allergies & Conditions
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPatient.allergies.map((a, i) => (
                    <span key={i} className="px-2.5 py-0.5 bg-rose-200/70 text-rose-900 rounded-lg text-[11px] font-bold">
                      Allergy: {a}
                    </span>
                  ))}
                  {selectedPatient.chronicConditions.map((c, i) => (
                    <span key={i} className="px-2.5 py-0.5 bg-amber-200/70 text-amber-900 rounded-lg text-[11px] font-bold">
                      Condition: {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Vitals & Core Metadata Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Blood Group</span>
                  <strong className="text-sm font-black text-slate-900 flex items-center gap-1 mt-0.5">
                    <Droplet size={14} className="text-rose-500" /> {selectedPatient.bloodGroup}
                  </strong>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Contact Phone</span>
                  <strong className="text-sm font-black text-slate-900 flex items-center gap-1 mt-0.5">
                    <Phone size={14} className="text-blue-600" /> {selectedPatient.phone}
                  </strong>
                </div>
              </div>

              {/* Latest Vitals Card */}
              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                  <Activity size={14} className="text-blue-600" /> Latest Recorded Vitals
                </h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-center">
                  <div className="p-2 bg-white rounded-xl border border-blue-100">
                    <span className="text-[10px] font-medium text-slate-400 block">Blood Pressure</span>
                    <strong className="text-xs font-black text-slate-900">{selectedPatient.latestVitals.bp}</strong>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-blue-100">
                    <span className="text-[10px] font-medium text-slate-400 block">Heart Rate</span>
                    <strong className="text-xs font-black text-slate-900">{selectedPatient.latestVitals.hr}</strong>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-blue-100">
                    <span className="text-[10px] font-medium text-slate-400 block">Temperature</span>
                    <strong className="text-xs font-black text-slate-900">{selectedPatient.latestVitals.temp}</strong>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-blue-100">
                    <span className="text-[10px] font-medium text-slate-400 block">SpO2</span>
                    <strong className="text-xs font-black text-slate-900">{selectedPatient.latestVitals.spo2}</strong>
                  </div>
                </div>
              </div>

              {/* Current Medications */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Current Medications</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedPatient.currentMedications.map((med, i) => (
                    <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-800 rounded-xl text-xs font-bold border border-slate-200">
                      💊 {med}
                    </span>
                  ))}
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Emergency Contact</span>
                  <strong className="text-xs font-black text-slate-900">{selectedPatient.emergencyContact.name} ({selectedPatient.emergencyContact.relation})</strong>
                </div>
                <span className="text-xs font-bold text-blue-600">{selectedPatient.emergencyContact.phone}</span>
              </div>

              {/* ================= 6. CLINICAL TIMELINE ================= */}
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Clock size={14} className="text-blue-600" /> Complete Clinical Timeline
                </h4>
                
                <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
                  {sampleTimeline.map((item) => (
                    <div key={item.id} className="relative flex items-start gap-3 pl-8">
                      <span className="absolute left-1.5 top-1 w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow" />
                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <strong className="text-xs font-black text-slate-900">{item.title}</strong>
                          <span className="text-[10px] font-semibold text-slate-400">{item.date}</span>
                        </div>
                        <p className="text-xs text-slate-600">{item.description}</p>
                        <span className="text-[10px] font-bold text-blue-600 block pt-1">{item.doctor}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Drawer Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedPatient(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Close Snapshot
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}