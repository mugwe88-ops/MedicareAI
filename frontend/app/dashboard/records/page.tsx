"use client";

import { useState, useEffect } from "react";
import { 
  FileText, 
  AlertCircle, 
  Pill, 
  Calendar, 
  Stethoscope, 
  Download, 
  Activity, 
  ShieldAlert, 
  FileCheck, 
  Syringe, 
  TestTube 
} from "lucide-react";

interface RecordItem {
  id: number;
  record_type?: string; // "clinical_note" | "prescription" | "lab_result" | "vaccination" | "sick_leave" | "allergy" | "vitals" | "referral"
  patient_name?: string;
  patient_age?: string | number;
  patient_number?: string;
  medication_details?: string;
  instructions?: string;
  status?: string;
  doctor_name?: string;
  created_at: string;
}

export default function RecordsPage() {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");

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

  // Helper to determine metadata title & icon styling based on record type
  const getRecordConfig = (rec: RecordItem) => {
    switch (rec.record_type) {
      case "clinical_note":
        return { title: "Doctor's Clinical Note", icon: <Stethoscope size={18} />, color: "text-emerald-600", bg: "bg-emerald-50 text-emerald-600", label: "Clinical Summary / Notes:" };
      case "lab_result":
        return { title: "Lab & Diagnostic Result", icon: <TestTube size={18} />, color: "text-purple-600", bg: "bg-purple-50 text-purple-600", label: "Test Results & Findings:" };
      case "vaccination":
        return { title: "Immunization Record", icon: <Syringe size={18} />, color: "text-cyan-600", bg: "bg-cyan-50 text-cyan-600", label: "Vaccine & Dosage Details:" };
      case "sick_leave":
        return { title: "Medical Leave Certificate", icon: <FileCheck size={18} />, color: "text-amber-600", bg: "bg-amber-50 text-amber-600", label: "Leave Period & Terms:" };
      case "allergy":
        return { title: "Allergy & Reaction Profile", icon: <ShieldAlert size={18} />, color: "text-rose-600", bg: "bg-rose-50 text-rose-600", label: "Allergen & Severity Details:" };
      case "vitals":
        return { title: "Vital Signs Summary", icon: <Activity size={18} />, color: "text-indigo-600", bg: "bg-indigo-50 text-indigo-600", label: "Biometric Metrics:" };
      case "referral":
        return { title: "Specialist Referral Letter", icon: <FileText size={18} />, color: "text-teal-600", bg: "bg-teal-50 text-teal-600", label: "Referral & Specialist Notes:" };
      case "prescription":
      default:
        return { title: `Prescription #${rec.id}`, icon: <Pill size={18} />, color: "text-blue-600", bg: "bg-blue-50 text-blue-600", label: "Medication Details:" };
    }
  };

  const handleDownloadSinglePDF = (rec: RecordItem) => {
    const config = getRecordConfig(rec);
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to download individual PDFs.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${config.title} - Swift MD</title>
          <style>
            body { font-family: Arial, sans-serif; color: #1e293b; padding: 40px; max-width: 700px; margin: 0 auto; }
            .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
            .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
            .badge { background: #eff6ff; color: #2563eb; padding: 6px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
            .patient-box { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 15px 20px; border-radius: 10px; margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; font-size: 13px; }
            .patient-box div span { display: block; font-weight: bold; color: #0f172a; margin-top: 2px; font-size: 14px; }
            .content-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; }
            .label { font-weight: bold; color: #0f172a; margin-bottom: 8px; }
            .details { white-space: pre-wrap; font-size: 14px; line-height: 1.6; color: #334155; }
            .footer { margin-top: 40px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">SWIFT MD</div>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">Official Medical Document</p>
            </div>
            <div class="badge">${rec.status || "Verified"}</div>
          </div>

          <h2>${config.title}</h2>
          <p style="font-size: 13px; color: #64748b; margin-bottom: 15px;">Recorded Date: ${new Date(rec.created_at).toLocaleDateString()}</p>

          <div class="patient-box">
            <div>Patient Name: <span>${rec.patient_name || "Valued Patient"}</span></div>
            <div>Age: <span>${rec.patient_age || "N/A"}</span></div>
            <div>Hospital Patient ID: <span>${rec.patient_number || `SMD-${rec.id}`}</span></div>
          </div>

          <div class="content-box">
            <div class="label">${config.label}</div>
            <div class="details">${rec.medication_details || "No details provided."}</div>
            ${rec.doctor_name ? `<p style="margin-top: 15px; font-weight: bold; font-size: 13px; color: #475569;">Attending Doctor / Lab: Dr. ${rec.doctor_name}</p>` : ""}
          </div>

          <div class="footer">
            <p>Generated securely via Swift MD Healthcare Platform.</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filteredRecords = filterType === "all" 
    ? records 
    : records.filter(r => (r.record_type || "prescription") === filterType);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Medical Records & Prescriptions</h1>
        <p className="text-slate-500 text-sm">
          Access your issued prescriptions, lab results, vaccination certificates, and clinical summaries. Click download on any card to export as a PDF.
        </p>
      </div>

      {/* FILTER TABS */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-200">
        {[
          { id: "all", label: "All Records" },
          { id: "prescription", label: "Prescriptions" },
          { id: "clinical_note", label: "Clinical Notes" },
          { id: "lab_result", label: "Lab Results" },
          { id: "vaccination", label: "Vaccinations" },
          { id: "sick_leave", label: "Sick Leave" },
          { id: "allergy", label: "Allergies" },
          { id: "vitals", label: "Vitals" },
          { id: "referral", label: "Referrals" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterType === tab.id 
                ? "bg-blue-600 text-white shadow-sm" 
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

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
      ) : filteredRecords.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-4 shadow-sm">
          <FileText size={48} className="mx-auto text-slate-300" />
          <div>
            <h3 className="font-bold text-slate-800 text-lg">No Records Found</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
              No medical documents match this filter category under your profile yet.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecords.map((rec, index) => {
            const config = getRecordConfig(rec);
            return (
              <div
                key={rec.id || index}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className={`flex items-center gap-2 font-bold ${config.color}`}>
                      {config.icon}
                      <span>{config.title}</span>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${config.bg}`}>
                      {rec.status || "Verified"}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-1">
                    <p className="font-semibold text-slate-900">
                      {config.label}
                    </p>
                    <p className="whitespace-pre-wrap">{rec.medication_details || "No details provided."}</p>
                    {rec.doctor_name && (
                      <p className="text-slate-500 pt-1 font-medium">Clinician / Issuer: Dr. {rec.doctor_name}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar size={14} /> {new Date(rec.created_at).toLocaleDateString()}
                  </p>
                  <button
                    onClick={() => handleDownloadSinglePDF(rec)}
                    className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow-sm"
                  >
                    <Download size={14} />
                    Download PDF
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}