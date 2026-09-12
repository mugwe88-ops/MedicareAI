// frontend/app/doctors/dashboard/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Bell, Mail, Users, Video, Camera, Upload, Check, X, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

interface DoctorInfo {
  name: string;
  email: string;
  specialty: string;
  avatar: string;
  portalStatus: string;
  status: string;
}

interface PerformanceData {
  efficiency_rating: number;
  practice_score: number;
  max_score: number;
  patient_satisfaction: number;
  total_reviews: number;
  avg_wait_time_mins: number;
  compliance_rate: number;
}

interface RecordItem {
  id: string;
  primaryText: string;
  secondaryText: string;
  date: string;
  comments: string;
  status: string;
}

interface Appointment {
  id: string;
  patientName: string;
  specialty: string;
  time: string;
  dateKey: string;
  status?: string;
  reason?: string;
}

interface WorkloadDataset {
  title: string;
  unit: string;
  totalLabel: string;
  bars: { height: string; value: string; day: string; isPeak?: boolean }[];
}

export default function DoctorDashboardPage() {
  const router = useRouter();
  const [activeSubTab, setActiveSubTab] = useState<"Lab Reports" | "Prescription" | "Medication" | "Diagnosis">("Lab Reports");
  const [selectedDate, setSelectedDate] = useState<string>("21");
  const [activeWorkloadTab, setActiveWorkloadTab] = useState<"Consultations" | "Telehealth" | "Follow-ups">("Consultations");
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isAllAppointmentsModalOpen, setIsAllAppointmentsModalOpen] = useState<boolean>(false);
  const [allAppointmentsSearch, setAllAppointmentsSearch] = useState<string>("");

  const [doctorInfo, setDoctorInfo] = useState<DoctorInfo | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [totalAppointmentsCount, setTotalAppointmentsCount] = useState<number>(0);

  // Profile Picture Upload States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState<boolean>(false);
  const [avatarUploadSuccess, setAvatarUploadSuccess] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Dynamic Medical Records state
  const [medicalRecordsData, setMedicalRecordsData] = useState<Record<string, RecordItem[]>>({
    "Lab Reports": [],
    "Prescription": [],
    "Medication": [],
    "Diagnosis": []
  });
  const [isRecordsLoading, setIsRecordsLoading] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPerformanceLoading, setIsPerformanceLoading] = useState<boolean>(false);
  const [isAppointmentsLoading, setIsAppointmentsLoading] = useState<boolean>(false);

  // Fetch doctor profile
  const fetchDoctorProfile = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://medicareai-1.onrender.com";

      if (!token) {
        setDoctorInfo({
          name: "Dr. Pressy Phides",
          email: "willyweyru1@gmail.com",
          specialty: "pediatrics",
          avatar: "",
          portalStatus: "Verified MD",
          status: "On Leave"
        });
        setIsLoading(false);
        return;
      }

      const endpoints = ["/api/doctors/me", "/api/auth/me", "/api/users/me", "/api/doctors/profile"];
      let data = null;
      let success = false;

      for (const endpoint of endpoints) {
        try {
          const res = await fetch(`${API_URL}${endpoint}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            data = await res.json();
            success = true;
            break;
          }
        } catch (e) {
          // Try next endpoint
        }
      }

      if (success && data) {
        const profile = data.doctor || data.user || data.profile || data;
        let rawName = profile.name || profile.fullName || "Pressy Phides";
        const formattedName = rawName.toLowerCase().startsWith("dr.") ? rawName : `Dr. ${rawName}`;

        const fetchedAvatar = profile.avatar || profile.avatarUrl || profile.profilePicture || "";
        setDoctorInfo({
          name: formattedName,
          email: profile.email || "willyweyru1@gmail.com",
          specialty: profile.specialty || profile.specialization || "pediatrics",
          avatar: fetchedAvatar,
          portalStatus: profile.portalStatus || profile.licenseStatus || "Verified MD",
          status: profile.status || (profile.isActive ? "Active Duty" : "On Leave") || "On Leave",
        });
        if (fetchedAvatar && !previewUrl) {
          setPreviewUrl(fetchedAvatar);
        }
      } else {
        setDoctorInfo({
          name: "Dr. Pressy Phides",
          email: "willyweyru1@gmail.com",
          specialty: "pediatrics",
          avatar: "",
          portalStatus: "Verified MD",
          status: "On Leave"
        });
      }
    } catch (error) {
      console.error("Failed to fetch doctor profile:", error);
      setDoctorInfo({
        name: "Dr. Pressy Phides",
        email: "willyweyru1@gmail.com",
        specialty: "pediatrics",
        avatar: "",
        portalStatus: "Verified MD",
        status: "On Leave"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch real performance data from backend
  const fetchPerformanceData = async () => {
    setIsPerformanceLoading(true);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://medicareai-1.onrender.com";

      if (!token) {
        setPerformanceData({
          efficiency_rating: 95.0,
          practice_score: 492,
          max_score: 500,
          patient_satisfaction: 4.9,
          total_reviews: 142,
          avg_wait_time_mins: 4,
          compliance_rate: 100.0,
        });
        setIsPerformanceLoading(false);
        return;
      }

      const res = await fetch(`${API_URL}/api/doctors/performance`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.performance) {
          setPerformanceData(data.performance);
        }
      } else {
        setPerformanceData({
          efficiency_rating: 95.0,
          practice_score: 492,
          max_score: 500,
          patient_satisfaction: 4.9,
          total_reviews: 142,
          avg_wait_time_mins: 4,
          compliance_rate: 100.0,
        });
      }
    } catch (err) {
      console.error("Failed to fetch performance data:", err);
      setPerformanceData({
        efficiency_rating: 95.0,
        practice_score: 492,
        max_score: 500,
        patient_satisfaction: 4.9,
        total_reviews: 142,
        avg_wait_time_mins: 4,
        compliance_rate: 100.0,
      });
    } finally {
      setIsPerformanceLoading(false);
    }
  };

  // Fetch live appointments from backend
  const fetchAppointments = async () => {
    setIsAppointmentsLoading(true);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://medicareai-1.onrender.com";

      if (!token) {
        setAllAppointments([]);
        setAppointments([]);
        setTotalAppointmentsCount(0);
        setIsAppointmentsLoading(false);
        return;
      }

      const endpoints = [
        `/api/appointments`,
        `/api/doctors/appointments`,
        `/api/appointments/me`
      ];

      let fetchedData = null;
      let success = false;

      for (const endpoint of endpoints) {
        try {
          const res = await fetch(`${API_URL}${endpoint}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            const data = await res.json();
            fetchedData = data.appointments || data.data || data;
            success = true;
            break;
          }
        } catch (e) {
          // Try next endpoint
        }
      }

      if (success && Array.isArray(fetchedData)) {
        const formatted: Appointment[] = fetchedData.map((item: any, idx: number) => {
          let dateStr = item.date || item.appointment_date || item.appointmentDate || "2026-09-21";
          let dayKey = dateStr.includes("-") ? dateStr.split("-").pop() || selectedDate : selectedDate;

          return {
            id: item.id || item._id || String(idx),
            patientName: item.patientName || item.patient_name || item.patient?.name || item.name || "Patient",
            specialty: item.specialty || item.type || item.department || "General Consultation",
            time: item.time || item.appointment_time || item.slot || "10:00",
            dateKey: dayKey,
            status: item.status || "Confirmed",
            reason: item.reason || "General Checkup"
          };
        });

        setAllAppointments(formatted);
        setTotalAppointmentsCount(formatted.length);

        const filtered = formatted.filter((a) => a.dateKey.endsWith(selectedDate) || a.dateKey === selectedDate);
        setAppointments(filtered);
      } else {
        setAllAppointments([]);
        setAppointments([]);
        setTotalAppointmentsCount(0);
      }
    } catch (error) {
      console.error("Failed to fetch appointments from backend:", error);
      setAllAppointments([]);
      setAppointments([]);
      setTotalAppointmentsCount(0);
    } finally {
      setIsAppointmentsLoading(false);
    }
  };

  // Fetch dynamic medical records
  const fetchMedicalRecords = async () => {
    setIsRecordsLoading(true);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://medicareai-1.onrender.com";

      if (!token) {
        setIsRecordsLoading(false);
        return;
      }

      const endpoints = [
        `/api/medical-records`,
        `/api/doctors/medical-records`,
        `/api/records`
      ];

      let fetchedData = null;
      let success = false;

      for (const endpoint of endpoints) {
        try {
          const res = await fetch(`${API_URL}${endpoint}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            const data = await res.json();
            fetchedData = data.records || data.data || data;
            success = true;
            break;
          }
        } catch (e) {
          // Try next endpoint
        }
      }

      if (success && Array.isArray(fetchedData)) {
        const labReports: RecordItem[] = [];
        const prescriptions: RecordItem[] = [];
        const medications: RecordItem[] = [];
        const diagnoses: RecordItem[] = [];

        fetchedData.forEach((item: any, idx: number) => {
          const record: RecordItem = {
            id: item.id || item._id || String(idx),
            primaryText: item.testName || item.medicineName || item.condition || item.title || item.primaryText || "Record",
            secondaryText: item.referredBy || item.prescribedBy || item.doctorName || "Attending Physician",
            date: item.date || item.createdAt ? new Date(item.date || item.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "28 Jan, 2026",
            comments: item.comments || item.notes || item.description || "N/A",
            status: item.status || "Normal"
          };

          const type = (item.type || item.category || "").toLowerCase();
          if (type.includes("prescript")) {
            prescriptions.push(record);
          } else if (type.includes("medicat")) {
            medications.push(record);
          } else if (type.includes("diagnos")) {
            diagnoses.push(record);
          } else {
            labReports.push(record);
          }
        });

        setMedicalRecordsData({
          "Lab Reports": labReports,
          "Prescription": prescriptions,
          "Medication": medications,
          "Diagnosis": diagnoses,
        });
      }
    } catch (error) {
      console.error("Failed to fetch medical records:", error);
    } finally {
      setIsRecordsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorProfile();
    fetchAppointments();
    fetchMedicalRecords();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAvatarUpload = async () => {
    if (!selectedFile) return;
    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("avatar", selectedFile);

      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://medicareai-1.onrender.com";

      const res = await fetch(`${API_URL}/api/doctors/avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        setAvatarUploadSuccess(true);
        setTimeout(() => setAvatarUploadSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Avatar upload failed:", err);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!doctorInfo) return;
    setDoctorInfo({ ...doctorInfo, status: newStatus });

    try {
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://medicareai-1.onrender.com";
      if (!token) return;

      await fetch(`${API_URL}/api/doctors/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (error) {
      console.error("Failed to update status on backend:", error);
    }
  };

  const workloadDatasets: Record<string, WorkloadDataset> = {
    Consultations: {
      title: "Weekly Patient Consultations",
      unit: "Patients",
      totalLabel: `${totalAppointmentsCount} Total`,
      bars: [
        { height: "h-12", value: "4", day: "Sat" },
        { height: "h-20", value: "8", day: "Sun" },
        { height: "h-14", value: "5", day: "Mon" },
        { height: "h-24", value: "11", day: "Tue", isPeak: true },
        { height: "h-16", value: "6", day: "Wed" },
        { height: "h-10", value: "4", day: "Thu" },
      ],
    },
    Telehealth: {
      title: "Telehealth Room Sessions",
      unit: "Sessions",
      totalLabel: "24 Total",
      bars: [
        { height: "h-10", value: "3", day: "Sat" },
        { height: "h-16", value: "6", day: "Sun" },
        { height: "h-12", value: "4", day: "Mon" },
        { height: "h-24", value: "7", day: "Tue", isPeak: true },
        { height: "h-14", value: "2", day: "Wed" },
        { height: "h-10", value: "2", day: "Thu" },
      ],
    },
    "Follow-ups": {
      title: "Scheduled Follow-up Reviews",
      unit: "Reviews",
      totalLabel: "19 Total",
      bars: [
        { height: "h-8", value: "2", day: "Sat" },
        { height: "h-12", value: "3", day: "Sun" },
        { height: "h-16", value: "5", day: "Mon", isPeak: true },
        { height: "h-14", value: "4", day: "Tue" },
        { height: "h-10", value: "3", day: "Wed" },
        { height: "h-8", value: "2", day: "Thu" },
      ],
    },
  };

  const currentWorkload = workloadDatasets[activeWorkloadTab];
  const currentTableData = medicalRecordsData[activeSubTab] || [];

  return (
    <div className="flex-1 flex flex-col p-6 lg:p-8 space-y-6 overflow-y-auto bg-slate-50 w-full relative">
      {/* TOP SEARCH & NOTIFICATION BAR */}
      <header className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white px-6 py-4 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search patients, invoice, appointments etc..."
            className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pl-11 pr-4 py-3 text-xs font-medium text-slate-800 outline-none focus:border-blue-600 transition"
          />
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button className="w-10 h-10 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center transition shadow-sm cursor-pointer relative">
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full"></span>
          </button>
          <button className="w-10 h-10 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center transition shadow-sm cursor-pointer">
            <Mail size={18} />
          </button>
        </div>
      </header>

      {/* DASHBOARD GRID CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT 2 COLUMNS */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Performance Card */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-black">Overall Performance</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold">
                  ↗ 95%
                </span>
              </div>

              <div className="flex flex-col items-center justify-center py-4">
                <div className="relative h-36 w-36 rounded-full border-8 border-slate-100 border-t-blue-600 flex flex-col items-center justify-center text-center shadow-inner">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Practice Score</span>
                  <span className="text-3xl font-black text-slate-900 mt-0.5">492</span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-4 text-center">
                  <strong className="text-slate-900 font-bold">{doctorInfo?.name || "Practitioner"}</strong> operates at <span className="text-blue-600 font-bold">95% efficiency</span>
                </p>
              </div>

              <button
                onClick={() => setIsReportModalOpen(true)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl transition shadow-md shadow-blue-500/20 cursor-pointer"
              >
                Check Full Report
              </button>
            </div>

            {/* Patient Workload & Analytics Widget */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-blue-600" />
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-black">Patient Workload</span>
                </div>
                <span className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-xl">
                  {currentWorkload.totalLabel}
                </span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto py-2">
                {(["Consultations", "Telehealth", "Follow-ups"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveWorkloadTab(tab)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold shrink-0 transition cursor-pointer ${
                      activeWorkloadTab === tab
                        ? "bg-slate-900 text-white shadow-sm"
                        : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-end justify-between gap-2 h-28 pt-4 px-2 border-b border-dashed border-slate-200">
                  {currentWorkload.bars.map((bar, idx) => (
                    <div
                      key={idx}
                      className={`w-8 rounded-t-xl transition-all duration-300 relative flex flex-col items-center ${
                        bar.isPeak ? "bg-blue-600 shadow-md shadow-blue-500/30" : "bg-blue-100 hover:bg-blue-200"
                      } ${bar.height}`}
                    >
                      {bar.isPeak && (
                        <span className="absolute -top-6 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap">
                          Peak ({bar.value})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-bold px-1">
                  {currentWorkload.bars.map((bar, i) => (
                    <span key={i}>{bar.day}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Booked Patients & Consultations Section */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Booked Patients & Scheduled Visits</h3>
                <p className="text-xs text-slate-400 font-medium">Patients who have booked appointments with you</p>
              </div>
              <button
                onClick={() => setIsAllAppointmentsModalOpen(true)}
                className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
              >
                View All ({allAppointments.length})
              </button>
            </div>

            {isAppointmentsLoading ? (
              <div className="py-8 text-center text-xs text-slate-400 font-bold">Loading booked appointments...</div>
            ) : allAppointments.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                No patients have booked consultations with you yet.
              </div>
            ) : (
              <div className="space-y-3">
                {allAppointments.slice(0, 5).map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-4 bg-slate-50/80 rounded-2xl border border-slate-100 hover:bg-slate-50 transition">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{apt.patientName}</p>
                      <p className="text-xs text-blue-600 font-semibold mt-0.5">
                        {apt.dateKey} @ {apt.time} • <span className="text-slate-500">{apt.specialty}</span>
                      </p>
                      {apt.reason && <p className="text-xs italic text-slate-400 mt-1">"{apt.reason}"</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full uppercase">
                        {apt.status || "Confirmed"}
                      </span>
                      <button
                        onClick={() => router.push(`/doctors/telehealth/${apt.id}`)}
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition cursor-pointer"
                        title="Start Telehealth Session"
                      >
                        <Video size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dynamic Medical Records Table Widget */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {(["Lab Reports", "Prescription", "Medication", "Diagnosis"] as const).map((subTab) => (
                  <button
                    key={subTab}
                    onClick={() => setActiveSubTab(subTab)}
                    className={`px-4 py-2 rounded-2xl text-xs font-bold transition cursor-pointer shrink-0 ${
                      activeSubTab === subTab
                        ? "bg-slate-900 text-white shadow-sm"
                        : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {subTab}
                  </button>
                ))}
              </div>
            </div>

            {isRecordsLoading ? (
              <div className="py-12 text-center text-xs text-slate-400 font-bold">Loading records...</div>
            ) : currentTableData.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                No records found for {activeSubTab}.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-400">
                      <th className="py-3 px-4">Primary Info</th>
                      <th className="py-3 px-4">Reference</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Comments</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs">
                    {currentTableData.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-4 px-4 font-bold text-slate-900">{item.primaryText}</td>
                        <td className="py-4 px-4 text-slate-600">{item.secondaryText}</td>
                        <td className="py-4 px-4 text-slate-500">{item.date}</td>
                        <td className="py-4 px-4 italic text-slate-400">{item.comments}</td>
                        <td className="py-4 px-4">
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full font-bold uppercase text-[10px]">
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: PROFILE & AVAILABILITY */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-black">Profile & Availability</span>
              <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2.5 py-1 rounded-lg">MD Sync</span>
            </div>

            {/* Avatar & Upload Section */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="relative group">
                <div className="w-24 h-24 rounded-3xl bg-blue-600 text-white font-black text-2xl flex items-center justify-center overflow-hidden shadow-md">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Doctor Avatar" className="w-full h-full object-cover" />
                  ) : (
                    doctorInfo?.name ? getInitials(doctorInfo.name) : "MD"
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-slate-900 hover:bg-black text-white rounded-xl shadow-lg transition cursor-pointer"
                  title="Change Profile Picture"
                >
                  <Camera size={14} />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <div>
                <h4 className="font-black text-slate-900 text-lg">{doctorInfo?.name || "Dr. Pressy Phides"}</h4>
                <p className="text-xs text-slate-400 font-bold capitalize">{doctorInfo?.specialty || "General Practitioner"}</p>
              </div>

              {selectedFile && (
                <button
                  onClick={handleAvatarUpload}
                  disabled={isUploadingAvatar}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  {isUploadingAvatar ? "Uploading..." : <><Upload size={14} /> Save New Photo</>}
                </button>
              )}

              {avatarUploadSuccess && (
                <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <Check size={14} /> Photo updated successfully!
                </p>
              )}
            </div>

            {/* Duty Status Toggle */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Duty Status</span>
                <span className={`font-bold ${doctorInfo?.status === "Active Duty" ? "text-emerald-600" : "text-amber-600"}`}>
                  {doctorInfo?.status || "On Leave"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleStatusChange("Active Duty")}
                  className={`py-2 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                    doctorInfo?.status === "Active Duty"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Active Duty
                </button>
                <button
                  onClick={() => handleStatusChange("On Leave")}
                  className={`py-2 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                    doctorInfo?.status === "On Leave"
                      ? "bg-amber-600 text-white shadow-sm"
                      : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  On Leave
                </button>
              </div>
            </div>

            {/* Additional Info */}
            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Email</span>
                <span className="text-slate-800 font-bold truncate max-w-[180px]">{doctorInfo?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Credential</span>
                <span className="text-emerald-600 font-bold">{doctorInfo?.portalStatus}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ALL APPOINTMENTS MODAL */}
      {isAllAppointmentsModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl border border-slate-100 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900">All Booked Patient Consultations</h3>
                <p className="text-xs text-slate-400 font-bold">Manage and review all scheduled patient sessions</p>
              </div>
              <button
                onClick={() => setIsAllAppointmentsModalOpen(false)}
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-3 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search by patient name or specialty..."
                value={allAppointmentsSearch}
                onChange={(e) => setAllAppointmentsSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-blue-600"
              />
            </div>

            <div className="space-y-3">
              {allAppointments
                .filter(a => a.patientName.toLowerCase().includes(allAppointmentsSearch.toLowerCase()) || a.specialty.toLowerCase().includes(allAppointmentsSearch.toLowerCase()))
                .map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{apt.patientName}</p>
                      <p className="text-xs text-blue-600 font-semibold">
                        {apt.dateKey} @ {apt.time} • <span className="text-slate-500">{apt.specialty}</span>
                      </p>
                      {apt.reason && <p className="text-xs italic text-slate-400 mt-1">"{apt.reason}"</p>}
                    </div>
                    <button
                      onClick={() => {
                        setIsAllAppointmentsModalOpen(false);
                        router.push(`/doctors/telehealth/${apt.id}`);
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Video size={14} /> Join
                    </button>
                  </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FULL PERFORMANCE REPORT MODAL */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900">Performance Report</h3>
                <p className="text-xs text-slate-400 font-bold">Detailed practice metrics & analytics</p>
              </div>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {isPerformanceLoading ? (
              <div className="py-8 text-center text-xs text-slate-400 font-bold">Loading metrics...</div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="flex justify-between p-3 bg-slate-50 rounded-2xl">
                  <span className="text-slate-500 font-medium">Efficiency Rating</span>
                  <span className="font-bold text-slate-900">{performanceData?.efficiency_rating || 95}%</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-50 rounded-2xl">
                  <span className="text-slate-500 font-medium">Practice Score</span>
                  <span className="font-bold text-slate-900">{performanceData?.practice_score || 492} / {performanceData?.max_score || 500}</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-50 rounded-2xl">
                  <span className="text-slate-500 font-medium">Patient Satisfaction</span>
                  <span className="font-bold text-emerald-600">⭐ {performanceData?.patient_satisfaction || 4.9} ({performanceData?.total_reviews || 142} reviews)</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-50 rounded-2xl">
                  <span className="text-slate-500 font-medium">Average Wait Time</span>
                  <span className="font-bold text-slate-900">{performanceData?.avg_wait_time_mins || 4} mins</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-50 rounded-2xl">
                  <span className="text-slate-500 font-medium">Compliance Rate</span>
                  <span className="font-bold text-blue-600">{performanceData?.compliance_rate || 100}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function getInitials(name: string): string {
  return name
    .replace(/^Dr\.\s+/i, "")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "MD";
}