"use client";

import { useState, useEffect } from "react";
import { FileText, AlertCircle, Pill, Calendar, Clock } from "lucide-react";

interface RecordItem {
  id: number;
  patient_name: string;
  medication_details: string;
  status: string;
  created_at: string;
}

export default function RecordsPage() {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMedicalRecords();
  }, []);

  const fetchMedicalRecords = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const res = await fetch("https://medicareai-1.onrender.com/api/records", {
        headers: {
          Authorization: `Bearer ${token || ""}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      setRecords(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Medical records fetch failed:", err);
      setError("Unable to load medical records. Please try again.");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Medical Records & Prescriptions</h1>
        <p className="text-slate-500 text-sm">
          Access your issued prescriptions and clinical summaries.
        </p>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3 shadow-sm">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-500">Retrieving patient health vault...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 p-6 rounded-2xl flex items-start gap-4 text-red-700">
          <AlertCircle size={24} className="shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="font-semibold text-sm">{error}</p>
            <button
              onClick={fetchMedicalRecords}
              className="text-xs bg-red-100 hover:bg-red-200 text-red-800 font-bold px-3 py-1.5 rounded-lg transition"
            >
              Retry
            </button>
          </div>
        </div>
      ) : records.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-4 shadow-sm">
          <FileText size={48} className="mx-auto text-slate-300" />
          <div>
            <h3 className="font-bold text-slate-800 text-lg">No Medical Records Found</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
              No prescriptions or lab records have been issued under your profile yet.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {records.map((rec) => (
            <div
              key={rec.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 text-blue-600 font-bold">
                  <Pill size={18} />
                  <span>Prescription #{rec.id}</span>
                </div>
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-600 capitalize">
                  {rec.status || "Issued"}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-700">
                <p className="font-semibold text-slate-900 mb-1">Medication Details:</p>
                <p className="whitespace-pre-wrap">{rec.medication_details}</p>
              </div>

              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar size={14} /> Issued on {new Date(rec.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}