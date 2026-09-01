"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, ArrowLeft, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

interface PatientInfo {
  name: string;
  email: string;
  gender: string;
  age: string | number;
  phone: string;
  avatar: string;
  status: string;
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
}

interface AnalyticsData {
  title: string;
  unit: string;
  peakLabel: string;
  healthScore?: number;
  stabilityPercentage?: number;
  bars: { height: string; value: string; label: string; isPeak?: boolean }[];
}

export default function PatientDashboardPage() {
  const router = useRouter();

  // Navigation & Interactive UI States
  const [activeSubTab, setActiveSubTab] = useState<"Lab Reports" | "Prescription" | "Medication" | "Diagnosis">("Lab Reports");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().getDate().toString());
  const [activeMetric, setActiveMetric] = useState<"Heart Rate" | "Blood Pressure" | "Glucose">("Heart Rate");
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState<"Weekly" | "Monthly">("Weekly");

  // Dynamic API Data States
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  // Loading & Error Handling States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [recordsLoading, setRecordsLoading] = useState<boolean>(false);
  const [appointmentsLoading, setAppointmentsLoading] = useState<boolean>(false);
  const [analyticsLoading, setAnalyticsLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const getApiUrl = () => process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  const getHeaders = useCallback(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") || localStorage.getItem("accessToken") : null;
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  // 1. Fetch Patient Profile
  const fetchPatientProfile = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
      if (!token) {
        setFetchError("Authentication token missing.");
        setIsLoading(false);
        return;
      }

      const res = await fetch(`${getApiUrl()}/api/user/profile`, {
        method: "GET",
        headers: getHeaders(),
      });

      if (res.ok) {
        const data = await res.json();
        const profile = data.patient || data.user || data;

        const fullName =
          profile.name ||
          (profile.first_name ? `${profile.first_name} ${profile.last_name || ""}`.trim() : null) ||
          profile.fullName ||
          "Patient";

        setPatientInfo({
          name: fullName,
          email: profile.email || "N/A",
          gender: profile.gender || "N/A",
          age: profile.age || "N/A",
          phone: profile.phone || profile.phoneNumber || "N/A",
          avatar: profile.avatar || profile.avatarUrl || profile.profilePicture || "",
          status: profile.status || "Patient Portal",
        });
      } else {
        const errData = await res.json().catch(() => ({}));
        setFetchError(errData.message || `Error ${res.status}`);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      setFetchError("Unable to reach backend API.");
    } finally {
      setIsLoading(false);
    }
  }, [getHeaders]);

  // 2. Fetch Dynamic Clinical Records based on Selected SubTab
  const fetchRecords = useCallback(async () => {
    setRecordsLoading(true);
    try {
      const categoryEndpoint = activeSubTab.toLowerCase().replace(" ", "-");
      const res = await fetch(`${getApiUrl()}/api/patient/records?category=${categoryEndpoint}`, {
        headers: getHeaders(),
      });

      if (res.ok) {
        const data = await res.json();
        const rawRecords = Array.isArray(data) ? data : data.records || [];
        
        const mappedRecords: RecordItem[] = rawRecords.map((item: any) => ({
          id: item._id || item.id,
          primaryText: item.title || item.name || item.medicineName || item.condition || "N/A",
          secondaryText: item.doctor || item.prescribedBy || item.referredBy || "Unassigned",
          date: item.date ? new Date(item.date).toLocaleDateString() : "N/A",
          comments: item.comments || item.instructions || item.notes || "None",
          status: item.status || "Normal",
        }));
        setRecords(mappedRecords);
      } else {
        setRecords([]);
      }
    } catch (error) {
      console.error("Failed to fetch records:", error);
      setRecords([]);
    } finally {
      setRecordsLoading(false);
    }
  }, [activeSubTab, getHeaders]);

  // 3. Fetch Appointments based on Selected Day
  const fetchAppointments = useCallback(async () => {
    setAppointmentsLoading(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/patient/appointments?day=${selectedDate}`, {
        headers: getHeaders(),
      });

      if (res.ok) {
        const data = await res.json();
        const rawAppts = Array.isArray(data) ? data : data.appointments || [];

        const mappedAppts: Appointment[] = rawAppts.map((item: any) => ({
          id: item._id || item.id,
          patientName: item.doctorName || item.patientName || "Medical Specialist",
          specialty: item.specialty || item.department || "General",
          time: item.time || "TBD",
          dateKey: selectedDate,
        }));
        setAppointments(mappedAppts);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      setAppointments([]);
    } finally {
      setAppointmentsLoading(false);
    }
  }, [selectedDate, getHeaders]);

  // 4. Fetch Vitals & Health Analytics
  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const metricQuery = activeMetric.toLowerCase().replace(" ", "_");
      const res = await fetch(`${getApiUrl()}/api/patient/analytics?metric=${metricQuery}&timeframe=${analyticsTimeframe.toLowerCase()}`, {
        headers: getHeaders(),
      });

      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      } else {
        setAnalytics(null);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      setAnalytics(null);
    } finally {
      setAnalyticsLoading(false);
    }
  }, [activeMetric, analyticsTimeframe, getHeaders]);

  useEffect(() => {
    fetchPatientProfile();
  }, [fetchPatientProfile]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "P";
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    router.push("/login");
  };

  return (
    <div className="flex-1 flex flex-col p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 overflow-x-hidden bg-slate-50 w-full max-w-full">
      {/* WELCOME BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Welcome Back, {isLoading ? "Loading..." : patientInfo?.name || "Patient"}
          </h1>
          <p className="text-xs font-bold text-slate-400 mt-1">
            Monitor your overall performance, active clinical records, and upcoming appointments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </div>

      {/* DASHBOARD GRID CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
        {/* LEFT 2 COLUMNS */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6 min-w-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            
            {/* Overall Performance / Health Score */}
            <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs uppercase tracking-wider text-slate-400 font-black">Overall Performance</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 bg-emerald-50 text-emerald-600 rounded-full text-[11px] sm:text-xs font-bold">
                  ↗ {analytics?.stabilityPercentage ?? 95}%
                </span>
              </div>

              <div className="flex flex-col items-center justify-center py-4">
                <div className="relative h-32 w-32 sm:h-36 sm:w-36 rounded-full border-8 border-slate-100 border-t-blue-600 flex flex-col items-center justify-center text-center shadow-inner">
                  <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase">Health Score</span>
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
                    {analytics?.healthScore ?? 492}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-3 text-center">
                  <strong className="text-slate-900 font-bold">{patientInfo?.name || "Patient"}</strong> maintains{" "}
                  <span className="text-blue-600 font-bold">{analytics?.stabilityPercentage ?? 95}% health stability</span>
                </p>
              </div>

              <button
                onClick={() => alert(`Generating clinical report for ${patientInfo?.name || "patient"}...`)}
                className="w-full py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl sm:rounded-2xl transition shadow-md shadow-blue-500/20 cursor-pointer"
              >
                Check Full Report
              </button>
            </div>

            {/* Analytics Chart Widget */}
            <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col justify-between min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs uppercase tracking-wider text-slate-400 font-black">Analytics</span>
                <button
                  onClick={() => setAnalyticsTimeframe((prev) => (prev === "Weekly" ? "Monthly" : "Weekly"))}
                  className="text-[11px] sm:text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg sm:rounded-xl transition cursor-pointer"
                >
                  {analyticsTimeframe} ▾
                </button>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto py-2 scrollbar-none">
                {(["Heart Rate", "Blood Pressure", "Glucose"] as const).map((metric) => (
                  <button
                    key={metric}
                    onClick={() => setActiveMetric(metric)}
                    className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] font-bold shrink-0 transition cursor-pointer ${
                      activeMetric === metric
                        ? "bg-slate-900 text-white shadow-sm"
                        : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {metric}
                  </button>
                ))}
              </div>

              {analyticsLoading ? (
                <div className="flex items-center justify-center h-28">
                  <RefreshCw size={18} className="animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="space-y-2 pt-2 w-full overflow-x-auto">
                  <div className="flex items-end justify-between gap-1.5 sm:gap-2 h-28 pt-6 px-1 border-b border-dashed border-slate-200 min-w-[240px]">
                    {analytics?.bars?.map((bar, idx) => (
                      <div
                        key={idx}
                        className={`flex-1 max-w-[36px] rounded-t-lg sm:rounded-t-xl transition-all duration-300 relative flex flex-col items-center ${
                          bar.isPeak ? "bg-blue-600 shadow-md shadow-blue-500/30" : "bg-blue-100 hover:bg-blue-200"
                        } ${bar.height}`}
                      >
                        {bar.isPeak && (
                          <span className="absolute -top-6 bg-slate-900 text-white text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap z-10">
                            {bar.value} {analytics.unit}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-[9px] sm:text-[10px] text-slate-400 font-bold px-1 min-w-[240px]">
                    {analytics?.bars?.map((bar, idx) => (
                      <span key={idx}>{bar.label}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Table Data Section */}
          <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-none">
                {(["Lab Reports", "Prescription", "Medication", "Diagnosis"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveSubTab(tab)}
                    className={`text-[11px] sm:text-xs font-black transition cursor-pointer pb-1 whitespace-nowrap ${
                      activeSubTab === tab ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[500px]">
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
                  {recordsLoading ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400 font-medium">
                        <RefreshCw size={18} className="animate-spin text-blue-600 inline mr-2" />
                        Fetching {activeSubTab}...
                      </td>
                    </tr>
                  ) : records.length > 0 ? (
                    records.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-2 font-black text-slate-900">{rec.primaryText}</td>
                        <td className="py-3 px-2 text-slate-600 font-medium">{rec.secondaryText}</td>
                        <td className="py-3 px-2 text-slate-500 font-medium">{rec.date}</td>
                        <td className="py-3 px-2 text-slate-700 font-bold">{rec.comments}</td>
                        <td className="py-3 px-2">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase ${
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
                      <td colSpan={5} className="py-6 text-center text-slate-400 font-medium">
                        No records found for {activeSubTab}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-4 sm:space-y-6">
          {/* Profile Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-xs font-black uppercase tracking-wider text-slate-400">
              <span className="text-blue-600">Profile Card</span>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-6 space-y-2">
                <RefreshCw size={20} className="animate-spin text-blue-600" />
                <p className="text-xs text-slate-400 font-bold">Fetching patient details...</p>
              </div>
            ) : fetchError ? (
              <div className="py-4 px-3 bg-rose-50 border border-rose-200 rounded-xl text-center space-y-2">
                <p className="text-xs font-bold text-rose-600">{fetchError}</p>
                <button
                  onClick={fetchPatientProfile}
                  className="px-3 py-1.5 bg-rose-600 text-white font-bold text-xs rounded-lg transition cursor-pointer"
                >
                  Retry
                </button>
              </div>
            ) : patientInfo ? (
              <>
                <div className="flex items-center gap-4 pt-1">
                  {patientInfo.avatar ? (
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden shadow-inner border border-slate-200">
                      <img src={patientInfo.avatar} alt={patientInfo.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 font-black text-xl flex items-center justify-center shadow-sm">
                      {getInitials(patientInfo.name)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-base font-black text-slate-900">{patientInfo.name}</h3>
                    <p className="text-xs text-slate-400 font-bold">{patientInfo.gender} • {patientInfo.age} yrs</p>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600 font-medium">
                  <p className="flex justify-between items-center">
                    <span className="text-slate-400">Email:</span>
                    <strong className="text-slate-900 text-right truncate max-w-[150px]">{patientInfo.email}</strong>
                  </p>
                  <p className="flex justify-between items-center">
                    <span className="text-slate-400">Phone:</span>
                    <strong className="text-slate-900">{patientInfo.phone}</strong>
                  </p>
                  <p className="flex justify-between items-center">
                    <span className="text-slate-400">Portal Status:</span>
                    <strong className="text-emerald-600">{patientInfo.status}</strong>
                  </p>
                </div>
              </>
            ) : null}
          </div>

          {/* Appointments Widget */}
          <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-400">
                Appointments ({selectedDate})
              </h3>
              <div className="flex items-center gap-1 text-slate-400 font-bold text-xs">
                <span>‹</span><span>›</span>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-1 text-center">
              {[
                { day: "19", label: "Mon" },
                { day: "20", label: "Tue" },
                { day: "21", label: "Wed" },
                { day: "22", label: "Thu" },
                { day: "23", label: "Fri" },
              ].map((item) => (
                <button
                  key={item.day}
                  onClick={() => setSelectedDate(item.day)}
                  className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-bold transition cursor-pointer ${
                    selectedDate === item.day ? "bg-blue-600 text-white font-black shadow-sm" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                  }`}
                >
                  <span className="block text-xs">{item.day}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            <div className="space-y-2.5 pt-1">
              {appointmentsLoading ? (
                <div className="py-5 text-center text-slate-400 text-xs font-medium">
                  <RefreshCw size={16} className="animate-spin text-blue-600 inline mr-2" />
                  Loading schedule...
                </div>
              ) : appointments.length > 0 ? (
                appointments.map((apt) => (
                  <div key={apt.id} className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl sm:rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-slate-900 text-xs">{apt.patientName}</h4>
                      <p className="text-[10px] text-slate-400 font-bold">{apt.specialty}</p>
                    </div>
                    <span className="text-xs font-black text-slate-800">{apt.time}</span>
                  </div>
                ))
              ) : (
                <div className="py-5 text-center text-slate-400 text-xs font-medium bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  No appointments scheduled.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
