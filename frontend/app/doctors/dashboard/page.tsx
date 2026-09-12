"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Bell, Mail, RefreshCw, Users, FileText, CheckCircle2, X, Calendar, Camera, Upload, Check } from "lucide-react";

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
}

interface WorkloadDataset {
  title: string;
  unit: string;
  totalLabel: string;
  bars: { height: string; value: string; day: string; isPeak?: boolean }[];
}

export default function DoctorDashboardPage() {
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

  // Fetch live appointments from backend (Neon DB)
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
          let dateStr = item.date || item.appointmentDate || "2026-09-21";
          let dayKey = dateStr.includes("-") ? dateStr.split("-").pop() || selectedDate : selectedDate;

          return {
            id: item.id || item._id || String(idx),
            patientName: item.patientName || item.patient?.name || item.name || "Patient",
            specialty: item.specialty || item.type || item.department || "General Consultation",
            time: item.time || item.slot || "10:00",
            dateKey: dayKey,
            status: item.status || "Confirmed"
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

  useEffect(() => {
    if (allAppointments.length > 0) {
      const filtered = allAppointments.filter((a) => a.dateKey.endsWith(selectedDate) || a.dateKey === selectedDate);
      setAppointments(filtered);
    } else {
      setAppointments([]);
    }
  }, [selectedDate, allAppointments]);

  const handleOpenReportModal = () => {
    setIsReportModalOpen(true);
    fetchPerformanceData(); 
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

  // Picture Selection & Upload Handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAvatarUploadSuccess(false);
    }
  };

  const handleAvatarUpload = async () => {
    if (!selectedFile && !previewUrl) return;
    setIsUploadingAvatar(true);
    setAvatarUploadSuccess(false);

    try {
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://medicareai-1.onrender.com";

      // If we have a file, send via FormData, else fallback to JSON sync
      let res;
      if (selectedFile) {
        const formData = new FormData();
        formData.append("avatar", selectedFile);

        res = await fetch(`${API_URL}/api/doctors/avatar`, {
          method: "POST",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: formData,
        });
      } else {
        res = await fetch(`${API_URL}/api/doctors/me`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ avatar: previewUrl }),
        });
      }

      if (res.ok) {
        const data = await res.json();
        const updatedAvatar = data.avatar || data.doctor?.avatar || previewUrl;
        if (doctorInfo) {
          setDoctorInfo({ ...doctorInfo, avatar: updatedAvatar });
        }
        setAvatarUploadSuccess(true);
        setSelectedFile(null);
        setTimeout(() => setAvatarUploadSuccess(false), 4000);
      } else {
        console.error("Avatar upload failed with status:", res.status);
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .replace(/^Dr\.\s+/i, "")
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "MD";
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
                onClick={handleOpenReportModal}
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

          {/* Dynamic Medical Records Table Widget */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3 overflow-x-auto">
                {(["Lab Reports", "Prescription", "Medication", "Diagnosis"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveSubTab(tab)}
                    className={`text-xs font-black transition cursor-pointer pb-1 whitespace-nowrap ${
                      activeSubTab === tab ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <span className="text-xs font-bold text-slate-400">Recent ▾</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 font-black uppercase tracking-wider border-b border-slate-100">
                    <th className="pb-3 px-2">
                      {activeSubTab === "Prescription"
                        ? "Medicine Name"
                        : activeSubTab === "Medication"
                        ? "Drug / Regimen"
                        : activeSubTab === "Diagnosis"
                        ? "Condition"
                        : "Test Name"}
                    </th>
                    <th className="pb-3 px-2">
                      {["Prescription", "Medication", "Diagnosis"].includes(activeSubTab) ? "Prescribed By" : "Referred by"}
                    </th>
                    <th className="pb-3 px-2">Date</th>
                    <th className="pb-3 px-2">Comments</th>
                    <th className="pb-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isRecordsLoading ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center">
                        <div className="flex items-center justify-center gap-2 text-slate-400 font-bold">
                          <RefreshCw size={16} className="animate-spin text-blue-600" />
                          <span>Loading records from database...</span>
                        </div>
                      </td>
                    </tr>
                  ) : currentTableData.length > 0 ? (
                    currentTableData.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-2 font-black text-slate-900">{rec.primaryText}</td>
                        <td className="py-3.5 px-2 text-slate-600 font-medium">{rec.secondaryText}</td>
                        <td className="py-3.5 px-2 text-slate-500 font-medium">{rec.date}</td>
                        <td className="py-3.5 px-2 text-slate-700 font-bold">{rec.comments}</td>
                        <td className="py-3.5 px-2">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                              ["Normal", "Active", "Confirmed"].includes(rec.status)
                                ? "bg-emerald-100 text-emerald-700"
                                : ["Pending", "Ongoing"].includes(rec.status)
                                ? "bg-amber-100 text-amber-700"
                                : "bg-purple-100 text-purple-700"
                            }`}
                          >
                            {rec.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-400 font-medium">
                        No {activeSubTab.toLowerCase()} found in the database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Active Doctor Profile & Picture Management */}
        <div className="space-y-6">
          {/* Profile & Availability / Picture Upload Component */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400">
                <span className="text-blue-600">Profile & Availability</span>
              </div>
              <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full">MD Sync</span>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-2">
                <RefreshCw size={24} className="animate-spin text-blue-600" />
                <p className="text-xs text-slate-400 font-bold">Loading profile data...</p>
              </div>
            ) : doctorInfo ? (
              <>
                <div className="flex flex-col items-center text-center space-y-3 pt-2">
                  {/* Picture Preview Container */}
                  <div className="relative group">
                    {previewUrl || doctorInfo.avatar ? (
                      <div className="w-24 h-24 rounded-3xl bg-slate-100 overflow-hidden shadow-inner border-2 border-slate-200">
                        <img 
                          src={previewUrl || doctorInfo.avatar} 
                          alt={doctorInfo.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-3xl bg-blue-600 text-white font-black text-2xl flex items-center justify-center shadow-md">
                        {getInitials(doctorInfo.name)}
                      </div>
                    )}

                    {/* Camera Badge Trigger */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center shadow-md transition cursor-pointer"
                      title="Select new picture"
                    >
                      <Camera size={14} />
                    </button>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="hidden"
                  />

                  <div>
                    <h3 className="text-base font-black text-slate-900">{doctorInfo.name}</h3>
                    <p className="text-xs text-blue-600 font-bold capitalize">{doctorInfo.specialty}</p>
                  </div>
                </div>

                {/* Upload Action Bar */}
                <div className="pt-2">
                  {selectedFile ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAvatarUpload}
                        disabled={isUploadingAvatar}
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                      >
                        {isUploadingAvatar ? (
                          <>
                            <RefreshCw size={14} className="animate-spin" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload size={14} />
                            <span>Save Picture</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl(doctorInfo.avatar);
                        }}
                        className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <Camera size={14} className="text-blue-600" />
                      <span>Change Profile Picture</span>
                    </button>
                  )}

                  {avatarUploadSuccess && (
                    <p className="flex items-center justify-center gap-1 text-[11px] text-emerald-600 font-bold mt-2 animate-fade-in">
                      <Check size={13} /> Picture updated successfully!
                    </p>
                  )}
                </div>

                {/* Credentials & Status Details */}
                <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs text-slate-600 font-medium">
                  <p className="flex justify-between items-center">
                    <span className="text-slate-400">Email:</span>
                    <strong className="text-slate-900 text-right truncate max-w-[180px]">{doctorInfo.email}</strong>
                  </p>
                  <p className="flex justify-between items-center">
                    <span className="text-slate-400">Portal:</span>
                    <strong className="text-emerald-600">{doctorInfo.portalStatus}</strong>
                  </p>
                  <p className="flex justify-between items-center">
                    <span className="text-slate-400">Duty Status:</span>
                    <select
                      value={doctorInfo.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className={`font-bold text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 outline-none cursor-pointer transition ${
                        doctorInfo.status === "Active Duty" 
                          ? "text-emerald-600 border-emerald-200 bg-emerald-50/50" 
                          : "text-amber-600 border-amber-200 bg-amber-50/50"
                      }`}
                    >
                      <option value="Active Duty">Active Duty</option>
                      <option value="On Leave">On Leave</option>
                    </select>
                  </p>
                </div>
              </>
            ) : null}
          </div>

          {/* Live Appointments Widget */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setIsAllAppointmentsModalOpen(true)}
                className="text-xs font-black uppercase tracking-wider text-slate-400 hover:text-blue-600 transition flex items-center gap-1.5 cursor-pointer group"
                title="Click to view all booked appointments"
              >
                <span>Appointments ({totalAppointmentsCount})</span>
                <span className="text-blue-600 opacity-0 group-hover:opacity-100 transition text-[10px]">View All →</span>
              </button>
              <div className="flex items-center gap-1 text-slate-400 font-bold text-xs">
                <span>‹</span><span>›</span>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-1.5 text-center">
              {[
                { day: "19", label: "Sat" },
                { day: "20", label: "Sun" },
                { day: "21", label: "Mon" },
                { day: "22", label: "Tue" },
                { day: "23", label: "Wed" },
              ].map((item) => (
                <button
                  key={item.day}
                  onClick={() => setSelectedDate(item.day)}
                  className={`p-2 rounded-xl text-[10px] font-bold transition cursor-pointer ${
                    selectedDate === item.day ? "bg-blue-600 text-white font-black shadow-sm" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                  }`}
                >
                  <span className="block text-xs">{item.day}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            <div className="space-y-3 pt-2">
              {isAppointmentsLoading ? (
                <div className="flex flex-col items-center justify-center py-6 space-y-2">
                  <RefreshCw size={20} className="animate-spin text-blue-600" />
                  <p className="text-[11px] text-slate-400 font-bold">Loading appointments...</p>
                </div>
              ) : appointments.length > 0 ? (
                appointments.map((apt) => (
                  <div key={apt.id} className="bg-slate-50 border border-slate-200/60 p-3.5 rounded-2xl space-y-1 hover:border-blue-300 transition">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-slate-900">{apt.patientName}</h4>
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">
                        {apt.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">{apt.specialty}</p>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs font-medium">
                  No appointments scheduled for this date.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}