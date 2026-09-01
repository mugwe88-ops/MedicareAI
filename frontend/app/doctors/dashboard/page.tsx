"use client";

import { useState, useEffect } from "react";
import { Search, Bell, Mail } from "lucide-react";

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
  bars: { height: string; value: string; isPeak?: boolean }[];
}

export default function DoctorDashboardPage() {
  const [activeSubTab, setActiveSubTab] = useState<"Lab Reports" | "Prescription" | "Medication" | "Diagnosis">("Lab Reports");
  const [selectedDate, setSelectedDate] = useState<string>("21");
  const [activeMetric, setActiveMetric] = useState<"Heart Rate" | "Blood Pressure" | "Glucose">("Heart Rate");
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState<"Weekly" | "Monthly">("Weekly");
  
  // Real Doctor Profile State
  const [doctorInfo, setDoctorInfo] = useState({
    name: "Dr. Pressy Phides",
    email: "pressy.phides@swiftmd.com",
    specialty: "General Medicine",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"
  });

  useEffect(() => {
    const storedName = localStorage.getItem("doctorName") || localStorage.getItem("userName");
    const storedEmail = localStorage.getItem("doctorEmail") || localStorage.getItem("userEmail");
    const storedSpecialty = localStorage.getItem("doctorSpecialty");
    const storedAvatar = localStorage.getItem("doctorAvatar");

    setDoctorInfo({
      name: storedName || "Dr. Pressy Phides",
      email: storedEmail || "pressy.phides@swiftmd.com",
      specialty: storedSpecialty || "General Practitioner",
      avatar: storedAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"
    });
  }, []);

  // Dynamic Analytics data matching the selected pill metric
  const analyticsDatasets: Record<string, AnalyticsData> = {
    "Heart Rate": {
      title: "Heart Rate Analytics",
      unit: "bpm",
      peakLabel: "167 bpm",
      bars: [
        { height: "h-12", value: "72" },
        { height: "h-20", value: "98" },
        { height: "h-14", value: "82" },
        { height: "h-24", value: "167", isPeak: true },
        { height: "h-16", value: "88" },
        { height: "h-10", value: "75" }
      ]
    },
    "Blood Pressure": {
      title: "Blood Pressure Trends",
      unit: "mmHg",
      peakLabel: "140/90",
      bars: [
        { height: "h-14", value: "120/80" },
        { height: "h-18", value: "125/82" },
        { height: "h-16", value: "122/80" },
        { height: "h-24", value: "140/90", isPeak: true },
        { height: "h-16", value: "118/78" },
        { height: "h-12", value: "120/80" }
      ]
    },
    "Glucose": {
      title: "Blood Glucose Levels",
      unit: "mg/dL",
      peakLabel: "180 mg/dL",
      bars: [
        { height: "h-10", value: "95" },
        { height: "h-16", value: "110" },
        { height: "h-12", value: "102" },
        { height: "h-24", value: "180", isPeak: true },
        { height: "h-14", value: "105" },
        { height: "h-10", value: "98" }
      ]
    }
  };

  const currentAnalytics = analyticsDatasets[activeMetric];

  // Actual Mock datasets corresponding to each sub-tab
  const tabDataMap: Record<string, RecordItem[]> = {
    "Lab Reports": [
      { id: "1", primaryText: "Electrocardiography", secondaryText: "Dr. Rafiqul Islam", date: "28 Jan, 2024", comments: "Good! Take rest", status: "Normal" },
      { id: "2", primaryText: "Liver biopsy", secondaryText: "Dr. Fahim Ahmed", date: "12 Jan, 2024", comments: "Waiting for diagram", status: "Pending" },
      { id: "3", primaryText: "Blood Test", secondaryText: "Dr. Asad Khan", date: "10 Jan, 2024", comments: "As needed", status: "Normal" },
      { id: "4", primaryText: "Esophageal pH test", secondaryText: "Dr. Shahid Ali", date: "24 Dec, 2023", comments: "Good", status: "Hepatitis" }
    ],
    "Prescription": [
      { id: "p1", primaryText: "Amoxicillin 500mg", secondaryText: "Dr. Pressy Phides", date: "28 Jan, 2024", comments: "Take 3 times daily", status: "Active" },
      { id: "p2", primaryText: "Omeprazole 20mg", secondaryText: "Dr. Fahim Ahmed", date: "15 Jan, 2024", comments: "Before breakfast", status: "Completed" }
    ],
    "Medication": [
      { id: "m1", primaryText: "Metformin 850mg", secondaryText: "Dr. Asad Khan", date: "20 Jan, 2024", comments: "With meals", status: "Ongoing" },
      { id: "m2", primaryText: "Lisinopril 10mg", secondaryText: "Dr. Shahid Ali", date: "18 Jan, 2024", comments: "Once daily morning", status: "Ongoing" }
    ],
    "Diagnosis": [
      { id: "d1", primaryText: "Type 2 Diabetes Mellitus", secondaryText: "Dr. Pressy Phides", date: "28 Jan, 2024", comments: "Monitor glucose levels", status: "Confirmed" },
      { id: "d2", primaryText: "Essential Hypertension", secondaryText: "Dr. Rafiqul Islam", date: "10 Jan, 2024", comments: "Low sodium diet advised", status: "Stable" }
    ]
  };

  const appointmentsMap: Record<string, Appointment[]> = {
    "19": [
      { id: "a1", patientName: "Sarah Jenkins", specialty: "General Consultation", time: "09:30", dateKey: "19" },
      { id: "a2", patientName: "Robert Fox", specialty: "Follow-up", time: "14:00", dateKey: "19" }
    ],
    "20": [
      { id: "a3", patientName: "Emily Watson", specialty: "Cardiology Review", time: "11:15", dateKey: "20" }
    ],
    "21": [
      { id: "a4", patientName: "Dr. Friedric Ziccardi", specialty: "Cardiologist", time: "17:00", dateKey: "21" },
      { id: "a5", patientName: "Dr. Abagael Bitsul", specialty: "Medicine", time: "20:00", dateKey: "21" }
    ],
    "22": [
      { id: "a6", patientName: "Michael Brown", specialty: "Diabetic Screening", time: "10:00", dateKey: "22" },
      { id: "a7", patientName: "Jessica Taylor", specialty: "General Checkup", time: "15:30", dateKey: "22" }
    ],
    "23": [
      { id: "a8", patientName: "David Miller", specialty: "Lab Review", time: "12:00", dateKey: "23" }
    ]
  };

  const currentTableData = tabDataMap[activeSubTab] || [];
  const currentAppointments = appointmentsMap[selectedDate] || [];

  return (
    <div className="flex-1 flex flex-col p-6 lg:p-8 space-y-6 overflow-y-auto bg-slate-50 w-full">
      
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
          
          {/* TOP ROW: Overall Performance & Analytics */}
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
                  <strong className="text-slate-900 font-bold">{doctorInfo.name}</strong> operates at <span className="text-blue-600 font-bold">95% efficiency</span>
                </p>
              </div>

              <button 
                onClick={() => alert(`Generating detailed clinical performance report for ${doctorInfo.name}...`)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl transition shadow-md shadow-blue-500/20 cursor-pointer"
              >
                Check Full Report
              </button>
            </div>

            {/* Analytics Chart Widget with Dynamic Pill Switchers */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-black">Analytics</span>
                <button 
                  onClick={() => setAnalyticsTimeframe(prev => prev === "Weekly" ? "Monthly" : "Weekly")}
                  className="text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-xl transition cursor-pointer"
                >
                  {analyticsTimeframe} ▾
                </button>
              </div>

              {/* Interactive Vitals Quick Pills */}
              <div className="flex items-center gap-2 overflow-x-auto py-2">
                {(["Heart Rate", "Blood Pressure", "Glucose"] as const).map((metric) => (
                  <button
                    key={metric}
                    onClick={() => setActiveMetric(metric)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold shrink-0 transition cursor-pointer ${
                      activeMetric === metric 
                        ? "bg-slate-900 text-white shadow-sm" 
                        : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {metric}
                  </button>
                ))}
              </div>

              {/* Dynamic Chart Bars & Tooltips */}
              <div className="space-y-2 pt-2">
                <div className="flex items-end justify-between gap-2 h-28 pt-4 px-2 border-b border-dashed border-slate-200">
                  {currentAnalytics.bars.map((bar, idx) => (
                    <div 
                      key={idx} 
                      className={`w-8 rounded-t-xl transition-all duration-300 relative flex flex-col items-center ${
                        bar.isPeak ? "bg-blue-600 shadow-md shadow-blue-500/30" : "bg-blue-100 hover:bg-blue-200"
                      } ${bar.height}`}
                    >
                      {bar.isPeak && (
                        <span className="absolute -top-6 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap">
                          {bar.value} {currentAnalytics.unit}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-bold px-1">
                  <span>Sat</span><span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span>
                </div>
              </div>
            </div>

          </div>

          {/* BOTTOM ROW: Dynamic Sub-tab Table Data */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5">
            
            {/* Sub-tabs selector */}
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

            {/* Table Data */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 font-black uppercase tracking-wider border-b border-slate-100">
                    <th className="pb-3 px-2">
                      {activeSubTab === "Prescription" ? "Medicine Name" : 
                       activeSubTab === "Medication" ? "Drug / Regimen" : 
                       activeSubTab === "Diagnosis" ? "Condition" : "Test Name"}
                    </th>
                    <th className="pb-3 px-2">
                      {activeSubTab === "Prescription" || activeSubTab === "Medication" || activeSubTab === "Diagnosis" ? "Prescribed By" : "Referred by"}
                    </th>
                    <th className="pb-3 px-2">Date</th>
                    <th className="pb-3 px-2">Comments</th>
                    <th className="pb-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentTableData.length > 0 ? (
                    currentTableData.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-2 font-black text-slate-900">{rec.primaryText}</td>
                        <td className="py-3.5 px-2 text-slate-600 font-medium">{rec.secondaryText}</td>
                        <td className="py-3.5 px-2 text-slate-500 font-medium">{rec.date}</td>
                        <td className="py-3.5 px-2 text-slate-700 font-bold">{rec.comments}</td>
                        <td className="py-3.5 px-2">
                          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                            ["Normal", "Active", "Confirmed"].includes(rec.status) ? "bg-emerald-100 text-emerald-700" :
                            ["Pending", "Ongoing"].includes(rec.status) ? "bg-amber-100 text-amber-700" :
                            "bg-purple-100 text-purple-700"
                          }`}>
                            {rec.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400 font-medium">No records found for {activeSubTab}.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: Active Doctor Profile & Interactive Appointments */}
        <div className="space-y-6">
          
          {/* Real Doctor Profile Card */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-xs font-black uppercase tracking-wider text-slate-400">
              <span className="text-blue-600">Active Doctor</span>
              <span className="text-slate-300">•</span>
              <span>Credentials</span>
            </div>

            <div className="flex flex-col items-center text-center space-y-3 pt-2">
              <div className="w-24 h-24 rounded-3xl bg-slate-100 overflow-hidden shadow-inner border border-slate-200">
                <img 
                  src={doctorInfo.avatar} 
                  alt={doctorInfo.name}
                  className="w-full h-full object-cover" 
                />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">{doctorInfo.name}</h3>
                <p className="text-xs text-blue-600 font-bold">{doctorInfo.specialty}</p>
              </div>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs text-slate-600 font-medium">
              <p className="flex justify-between items-center"><span className="text-slate-400">Email:</span> <strong className="text-slate-900 text-right truncate max-w-[180px]">{doctorInfo.email}</strong></p>
              <p className="flex justify-between items-center"><span className="text-slate-400">Portal:</span> <strong className="text-emerald-600">Verified MD</strong></p>
              <p className="flex justify-between items-center"><span className="text-slate-400">Status:</span> <strong className="text-slate-900">Active Duty</strong></p>
            </div>
          </div>

          {/* Appointments List Widget with Interactive Date Slider */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Appointments ({selectedDate})</h3>
              <div className="flex items-center gap-1 text-slate-400 font-bold text-xs">
                <span>‹</span><span>›</span>
              </div>
            </div>

            {/* Clickable Date Slider Pills */}
            <div className="grid grid-cols-5 gap-1.5 text-center">
              {[
                { day: "19", label: "Mon" },
                { day: "20", label: "Mon" },
                { day: "21", label: "Sun" },
                { day: "22", label: "Mon" },
                { day: "23", label: "Tue" }
              ].map((item) => (
                <button
                  key={item.day}
                  onClick={() => setSelectedDate(item.day)}
                  className={`p-2 rounded-xl text-[10px] font-bold transition cursor-pointer ${
                    selectedDate === item.day 
                      ? "bg-blue-600 text-white font-black shadow-sm" 
                      : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                  }`}
                >
                  <span className="block text-xs">{item.day}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Scheduled items matching selected date */}
            <div className="space-y-3 pt-2">
              {currentAppointments.length > 0 ? (
                currentAppointments.map((apt) => (
                  <div key={apt.id} className="p-3.5 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-center justify-between animate-fadeIn">
                    <div>
                      <h4 className="font-black text-slate-900 text-xs">{apt.patientName}</h4>
                      <p className="text-[10px] text-slate-400 font-bold">{apt.specialty}</p>
                    </div>
                    <span className="text-xs font-black text-slate-800">{apt.time}</span>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-slate-400 text-xs font-medium bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
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