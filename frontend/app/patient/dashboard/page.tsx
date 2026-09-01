"use client";

import { useState, useEffect } from "react";
import { Search, FileText, Calendar, Phone, Mail, AlertCircle, RefreshCw, ChevronRight } from "lucide-react";

interface PatientRecord {
  id: string;
  name: string;
  age: number;
  gender: string;
  condition: string;
  lastVisit: string;
  phone: string;
  email: string;
  status: "Stable" | "Critical" | "Under Observation";
  vitals: {
    bp: string;
    heartRate: string;
    temp: string;
  };
}

export default function DoctorPatientsPage() {
  const [patientsList, setPatientsList] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [activePatient, setActivePatient] = useState<PatientRecord | null>(null);

  const statuses = ["All", "Stable", "Under Observation", "Critical"];

  const fetchPatients = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/doctors/patients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPatientsList(Array.isArray(data) ? data : []);
      } else {
        setError("Failed to fetch patient records from the database.");
      }
    } catch (err) {
      console.error("Network error fetching patients:", err);
      setError("Network error connecting to backend API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const filteredPatients = patientsList.filter((pat) => {
    const matchesSearch =
      pat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pat.condition?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pat.id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "All" || pat.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 px-4 sm:px-6 py-4">
      
      {/* Welcome Message Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">Welcome back, Doctor</h2>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 font-medium">Here is the overview of your assigned patients and clinical records for today.</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3.5 py-1.5 bg-white/15 border border-white/20 rounded-2xl text-xs font-bold backdrop-blur-sm">
            Portal Active
          </span>
        </div>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <div>
          <span className="text-xs uppercase tracking-wider text-blue-600 font-black block mb-1">Clinical Directory</span>
          <h1 className="text-xl font-black text-slate-900">Patient Records</h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">Access clinical histories, past diagnoses, and medical files for patients you have seen.</p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <span className="px-3.5 py-2 bg-blue-50 text-blue-700 text-xs font-bold rounded-2xl border border-blue-100">
            Total Active: {patientsList.length}
          </span>
          <button
            onClick={fetchPatients}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition cursor-pointer shadow-sm"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-2xl flex items-center gap-2 font-bold shadow-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by patient name, ID, or condition..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200/85 rounded-2xl pl-11 pr-4 py-3 text-xs font-medium text-slate-800 outline-none focus:border-blue-600 shadow-sm transition"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition cursor-pointer shadow-sm ${
                selectedStatus === status
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 text-center py-16 bg-white border border-slate-100 rounded-3xl text-slate-400 font-bold text-xs shadow-sm">
            Fetching patient records from database...
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="col-span-2 text-center py-16 bg-white border border-slate-100 rounded-3xl text-slate-400 font-bold text-xs shadow-sm">
            No patient records found for your account.
          </div>
        ) : (
          filteredPatients.map((pat) => (
            <div
              key={pat.id}
              className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="text-xs font-black text-slate-400">{pat.id}</span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    pat.status === "Stable"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      : pat.status === "Under Observation"
                      ? "bg-amber-50 text-amber-700 border border-amber-100"
                      : "bg-rose-50 text-rose-700 border border-rose-100"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      pat.status === "Stable" ? "bg-emerald-500" : pat.status === "Under Observation" ? "bg-amber-500" : "bg-rose-500"
                    }`} />
                    {pat.status}
                  </span>
                </div>

                <div className="flex items-center space-x-3.5 mb-5">
                  <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm shadow-sm">
                    {pat.name ? pat.name.split(" ").map(n => n[0]).join("") : "PT"}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm">{pat.name}</h3>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">{pat.gender}, {pat.age} yrs • <span className="text-blue-600 font-bold">{pat.condition}</span></p>
                  </div>
                </div>

                {/* Vitals Quick Preview */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-100 rounded-2xl p-3.5 mb-5 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 font-black block uppercase tracking-wider">BP</span>
                    <span className="text-xs font-black text-slate-800 mt-0.5 block">{pat.vitals?.bp || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-black block uppercase tracking-wider">Heart Rate</span>
                    <span className="text-xs font-black text-slate-800 mt-0.5 block">{pat.vitals?.heartRate || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-black block uppercase tracking-wider">Temp</span>
                    <span className="text-xs font-black text-slate-800 mt-0.5 block">{pat.vitals?.temp || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-[11px