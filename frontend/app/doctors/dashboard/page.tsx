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
      // Fetches exclusively from the backend API route linked to the authenticated doctor
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
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Welcome Message Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold">Welcome back, Doctor</h2>
          <p className="text-xs text-blue-100 mt-1">Here is the overview of your assigned patients and clinical records for today.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-white/10 border border-white/20 rounded-xl text-xs font-semibold">
            Portal Active
          </span>
        </div>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div>
          <span className="text-xs uppercase tracking-wider text-blue-600 font-bold block mb-1">Clinical Directory</span>
          <h1 className="text-xl font-extrabold text-gray-900">Patient Records</h1>
          <p className="text-xs text-gray-500 mt-1">Access clinical histories, past diagnoses, and medical files for patients you have seen.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-xl border border-blue-100">
            Total Active: {patientsList.length}
          </span>
          <button
            onClick={fetchPatients}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-3 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search by patient name, ID, or condition..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedStatus === status
                  ? "bg-blue-600 text-white shadow"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 text-center py-16 bg-white border border-gray-200 rounded-2xl text-gray-400 font-bold text-xs">
            Fetching patient records from database...
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="col-span-2 text-center py-16 bg-white border border-gray-200 rounded-2xl text-gray-400 font-bold text-xs">
            No patient records found for your account.
          </div>
        ) : (
          filteredPatients.map((pat) => (
            <div
              key={pat.id}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold text-gray-400">{pat.id}</span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    pat.status === "Stable"
                      ? "bg-green-50 text-green-700 border border-green-100"
                      : pat.status === "Under Observation"
                      ? "bg-amber-50 text-amber-700 border border-amber-100"
                      : "bg-red-50 text-red-700 border border-red-100"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      pat.status === "Stable" ? "bg-green-500" : pat.status === "Under Observation" ? "bg-amber-500" : "bg-red-500"
                    }`} />
                    {pat.status}
                  </span>
                </div>

                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                    {pat.name ? pat.name.split(" ").map(n => n[0]).join("") : "PT"}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{pat.name}</h3>
                    <p className="text-xs text-gray-500">{pat.gender}, {pat.age} yrs • <span className="text-blue-600 font-semibold">{pat.condition}</span></p>
                  </div>
                </div>

                {/* Vitals Quick Preview */}
                <div className="grid grid-cols-3 gap-2 bg-gray-50 border border-gray-100 rounded-xl p-3 mb-4 text-center">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold block uppercase">BP</span>
                    <span className="text-xs font-bold text-gray-800">{pat.vitals?.bp || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold block uppercase">Heart Rate</span>
                    <span className="text-xs font-bold text-gray-800">{pat.vitals?.heartRate || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold block uppercase">Temp</span>
                    <span className="text-xs font-bold text-gray-800">{pat.vitals?.temp || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-[11px] text-gray-400 flex items-center gap-1">
                  <Calendar size={12} /> Last Visit: {pat.lastVisit}
                </span>
                <button
                  onClick={() => setActivePatient(pat)}
                  className="inline-flex items-center gap-1 px-3.5 py-2 bg-gray-900 hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm"
                >
                  View Full Chart <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Patient Detail Modal */}
      {activePatient && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-xl w-full p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-xs text-blue-600 font-bold uppercase">{activePatient.id}</span>
                <h2 className="text-lg font-extrabold text-gray-900">{activePatient.name}</h2>
              </div>
              <button
                onClick={() => setActivePatient(null)}
                className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-xs transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                <div>
                  <span className="text-gray-400 block font-semibold mb-1">Contact Information</span>
                  <p className="text-gray-800 flex items-center gap-1.5"><Phone size={12} /> {activePatient.phone}</p>
                  <p className="text-gray-800 flex items-center gap-1.5 mt-1"><Mail size={12} /> {activePatient.email}</p>
                </div>
                <div>
                  <span className="text-gray-400 block font-semibold mb-1">Clinical Status</span>
                  <p className="text-gray-900 font-bold">{activePatient.condition}</p>
                  <p className="text-blue-600 font-semibold mt-1">Status: {activePatient.status}</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-2">Recorded Vitals</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 border border-gray-200 rounded-xl text-center">
                    <span className="text-[10px] text-gray-400 font-bold block">Blood Pressure</span>
                    <span className="text-sm font-extrabold text-gray-900">{activePatient.vitals?.bp || "N/A"}</span>
                  </div>
                  <div className="p-3 border border-gray-200 rounded-xl text-center">
                    <span className="text-[10px] text-gray-400 font-bold block">Heart Rate</span>
                    <span className="text-sm font-extrabold text-gray-900">{activePatient.vitals?.heartRate || "N/A"}</span>
                  </div>
                  <div className="p-3 border border-gray-200 rounded-xl text-center">
                    <span className="text-[10px] text-gray-400 font-bold block">Temperature</span>
                    <span className="text-sm font-extrabold text-gray-900">{activePatient.vitals?.temp || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
              <button
                onClick={() => setActivePatient(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert(`Downloading clinical report for ${activePatient.name}`);
                  setActivePatient(null);
                }}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
              >
                <FileText size={14} /> Download Clinical Report
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}