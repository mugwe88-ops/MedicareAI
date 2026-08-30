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
  record_type?: string;
  patient_name?: string;
  patient_age?: string | number;
  patient_number?: string;
  medication_details?: string;
  clinical_notes?: string;
  test_ordered?: string;
  test_name?: string;           // Added to match backend database structure
  clinical_instructions?: string; // Added to match backend database structure
  diagnosis?: string;
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

  // Helper to safely extract record details, prioritizing test_name for lab/diagnostic rows
  // Helper to safely extract record details across all possible backend keys
  const getRecordDetails = (rec: any) => {
    return (
      rec.test_name || 
      rec.medication_details || 
      rec.clinical_notes || 
      rec.test_ordered || 
      rec.diagnosis || 
      rec.clinical_instructions ||
      "No details provided."
    );
  };

  // Compute exact sequential numbers per category globally across all records
  const getGlobalNumberedRecords = () => {
    const counters: { [key: string]: number } = {
      clinical_note: 0,
      diagnostic: 0,
      lab_result: 0,
      vaccination: 0,
      sick_leave: 0,
      allergy: 0,
      vitals: 0,
      referral: 0,
      prescription: 0
    };

    return records.map(rec => {
      let type = rec.record_type || "prescription";
      if (type === "lab_result") type = "diagnostic"; 
      counters[type] = (counters[type] || 0) + 1;
      return { ...rec, sequenceNum: counters[type] };
    });
  };

  const processedRecords = getGlobalNumberedRecords();

  const getRecordConfig = (rec: RecordItem & { sequenceNum: number }) => {
    const type = rec.record_type || "prescription";
    const details = getRecordDetails(rec).toLowerCase();
     
    const isSpecialtyDiagnostic = 
      details.includes("cardiology") || 
      details.includes("ecg") || 
      details.includes("echocardiogram") || 
      details.includes("x-ray") || 
      details.includes("imaging") || 
      details.includes("ct") || 
      details.includes("mri") || 
      details.includes("ultrasound") ||
      details.includes("radiology");

    switch (type) {
      case "clinical_note":
        return { title: `Doctor's Clinical Note ${rec.sequenceNum}`, icon: <Stethoscope size={18} />, color: "text-emerald-600", bg: "bg-emerald-50 text-emerald-600", label: "Clinical Summary / Notes:" };
      case "diagnostic":
      case "lab_result":
        if (isSpecialtyDiagnostic) {
          return { title: `Procedure / Diagnostic Order ${rec.sequenceNum}`, icon: <Activity size={18} />, color: "text-amber-600", bg: "bg-amber-50 text-amber-600", label: "Order Details:" };
        }
        return { title: `Lab Request ${rec.sequenceNum}`, icon: <TestTube size={18} />, color: "text-purple-600", bg: "bg-purple-50 text-purple-600", label: "Test Ordered:" };
      case "vaccination":
        return { title: `Immunization Record ${rec.sequenceNum}`, icon: <Syringe size={18} />, color: "text-cyan-600", bg: "bg-cyan-50 text-cyan-600", label: "Vaccine Details:" };
      case "sick_leave":
        return { title: `Medical Leave Certificate ${rec.sequenceNum}`, icon: <FileCheck size={18} />, color: "text-amber-600", bg: "bg-amber-50 text-amber-600", label: "Leave Period:" };
      case "allergy":
        return { title: `Allergy Profile ${rec.sequenceNum}`, icon: <ShieldAlert size={18} />, color: "text-rose-600", bg: "bg-rose-50 text-rose-600", label: "Allergen Details:" };
      case "vitals":
        return { title: `Vital Signs Summary ${rec.sequenceNum}`, icon: <Activity size={18} />, color: "text-indigo-600", bg: "bg-indigo-50 text-indigo-600", label: "Biometric Metrics:" };
      case "referral":
        return { title: `Specialist Referral ${rec.sequenceNum}`, icon: <FileText size={18} />, color: "text-teal-600", bg: "bg-teal-50 text-teal-600", label: "Referral Notes:" };
      case "prescription":
      default:
        return { title: `Prescription ${rec.sequenceNum}`, icon: <Pill size={18} />, color: "text-blue-600", bg: "bg-blue-50 text-blue-600", label: "Medication Details:" };
    }
  };

  const handleDownloadSinglePDF = (rec: RecordItem & { sequenceNum: number }) => {
    const config = getRecordConfig(rec);
    const isLab = rec.record_type === "diagnostic" || rec.record_type === "lab_result";
    const detailsText = getRecordDetails(rec);
    const logoUrl = `${window.location.origin}/swift-logo.png`;

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
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
             
            body { 
              font-family: 'Inter', sans-serif; 
              color: #0f172a; 
              padding: 48px; 
              max-width: 750px; 
              margin: 0 auto; 
              background-color: #ffffff;
              -webkit-print-color-adjust: exact;
            }
            .header { 
              display: flex; 
              justify-content: space-between; 
              align-items: flex-start; 
              border-bottom: 2px solid #f1f5f9; 
              padding-bottom: 24px; 
              margin-bottom: 28px; 
            }
            .logo-area { display: flex; align-items: center; gap: 12px; }
            .logo-img { width: 40px; height: 40px; object-fit: contain; border-radius: 10px; }
            .logo-text { font-size: 20px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px; }
            .logo-sub { font-size: 12px; color: #64748b; font-weight: 500; margin-top: 2px; }
             
            .badge { 
              background: #eff6ff; 
              color: #1d4ed8; 
              padding: 6px 14px; 
              border-radius: 9999px; 
              font-size: 11px; 
              font-weight: 700; 
              text-transform: uppercase; 
              letter-spacing: 0.5px;
              border: 1px solid #dbeafe;
            }
             
            .doc-title-section { margin-bottom: 24px; }
            .doc-title { font-size: 22px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px; margin: 0 0 4px 0; }
            .doc-date { font-size: 13px; color: #64748b; font-weight: 500; }

            .patient-box { 
              background: #f8fafc; 
              border: 1px solid #e2e8f0; 
              padding: 16px 20px; 
              border-radius: 12px; 
              margin-bottom: 24px; 
              display: grid; 
              grid-template-columns: 2fr 1fr 1fr; 
              gap: 16px; 
            }
            .patient-field span { display: block; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 2px; }
            .patient-field strong { font-size: 14px; color: #0f172a; font-weight: 600; }

            .main-content-card { 
              background: #ffffff; 
              border: 2px solid #e2e8f0; 
              border-radius: 16px; 
              padding: 24px; 
              margin-bottom: 32px; 
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
            }
            .content-label { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #2563eb; letter-spacing: 0.5px; margin-bottom: 8px; }
            .primary-details { font-size: 16px; font-weight: 600; color: #0f172a; line-height: 1.6; }
             
            .notes-section { 
              margin-top: 18px; 
              padding-top: 16px; 
              border-top: 1px dashed #cbd5e1; 
            }
            .notes-label { font-size: 12px; font-weight: 700; color: #475569; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
            .notes-body { font-size: 14px; color: #334155; line-height: 1.6; white-space: pre-wrap; }

            .doctor-signature { 
              margin-top: 24px; 
              display: flex; 
              justify-content: space-between; 
              align-items: center;
              padding-top: 16px;
              border-top: 1px solid #f1f5f9;
            }
            .doctor-name { font-size: 14px; font-weight: 600; color: #0f172a; }
            .doctor-role { font-size: 12px; color: #64748b; }

            .footer { 
              display: flex; 
              justify-content: space-between; 
              align-items: center; 
              font-size: 11px; 
              color: #94a3b8; 
              border-top: 1px solid #f1f5f9; 
              padding-top: 20px; 
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-area">
              <img src="${logoUrl}" alt="Swift MD Logo" class="logo-img" onerror="this.style.display='none'" />
              <div>
                <div class="logo-text">SWIFT MD</div>
                <div class="logo-sub">Official Medical Record & Health Suite</div>
              </div>
            </div>
            <div class="badge">${rec.status || "Verified"}</div>
          </div>

          <div class="doc-title-section">
            <h1 class="doc-title">${config.title}</h1>
            <div class="doc-date">Issued on: ${new Date(rec.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>

          <div class="patient-box">
            <div class="patient-field">
              <span>Patient Name</span>
              <strong>${rec.patient_name || "Valued Patient"}</strong>
            </div>
            <div class="patient-field">
              <span>Age</span>
              <strong>${rec.patient_age || "N/A"}</strong>
            </div>
            <div class="patient-field">
              <span>Patient ID</span>
              <strong>${rec.patient_number || `SMD-${rec.id}`}</strong>
            </div>
          </div>

          <div class="main-content-card">
            <div class="content-label">${config.label}</div>
            <div class="primary-details">${detailsText}</div>

            ${rec.instructions || rec.clinical_instructions ? `
              <div class="notes-section">
                <div class="notes-label">${isLab ? "Clinical Notes / Reason" : "Clinical Instructions / Notes"}</div>
                <div class="notes-body">${rec.instructions || rec.clinical_instructions}</div>
              </div>
            ` : ""}

            <div class="doctor-signature">
              <div>
                <div class="doctor-name">Dr. ${rec.doctor_name || "PRESSY PHIDES"}</div>
                <div class="doctor-role">Attending Clinician & Medical Issuer</div>
              </div>
              <div style="font-size: 12px; font-weight: 600; color: #2563eb;">Digitally Verified</div>
            </div>
          </div>

          <div class="footer">
            <div>Securely generated via Swift MD Healthcare Platform</div>
            <div>Document Ref: #SMD-REC-${rec.id}</div>
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
    ? processedRecords 
    : processedRecords.filter(r => {
        const type = r.record_type || "prescription";
        if (filterType === "lab_result") {
          return type === "lab_result" || type === "diagnostic";
        }
        return type === filterType;
      });

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
          {filteredRecords.map((rec) => {
            const config = getRecordConfig(rec);
            const isLab = rec.record_type === "diagnostic" || rec.record_type === "lab_result";
            const isClinicalNote = rec.record_type === "clinical_note";
            const detailsText = getRecordDetails(rec);
            const detailsItems = detailsText.split(/[\n,;]+/).map(i => i.trim()).filter(Boolean);

            return (
              <div
                key={rec.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className={`flex items-center gap-2 font-bold ${config.color}`}>
                      {config.icon}
                      <div>
                        <span className="text-sm block">{config.title}</span>
                        <span className="text-xs font-medium text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar size={12} /> {new Date(rec.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize shrink-0 ${config.bg}`}>
                      {rec.status || "Verified"}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-2">
                    <div>
                      <p className="font-semibold text-slate-900">{config.label}</p>
                      {detailsItems.length > 1 ? (
                        <ol className="list-decimal list-inside space-y-1 mt-1">
                          {detailsItems.map((item, idx) => (
                            <li key={idx} className="leading-relaxed">
                              <span>{item}</span>
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <p className="whitespace-pre-wrap mt-0.5">{detailsText}</p>
                      )}
                    </div>

                    {(rec.instructions || rec.clinical_instructions) && (!isClinicalNote || (rec.instructions || rec.clinical_instructions) !== detailsText) && (
                      <div className="pt-2 border-t border-slate-200/60">
                        <p className="font-semibold text-slate-900">
                          {isLab ? "Clinical Notes / Reason:" : "Clinical Notes / Instructions:"}
                        </p>
                        <p className="whitespace-pre-wrap mt-0.5">{rec.instructions || rec.clinical_instructions}</p>
                      </div>
                    )}

                    {rec.doctor_name && (
                      <p className="text-slate-500 pt-1 font-medium">Clinician / Issuer: Dr. {rec.doctor_name}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end items-center pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleDownloadSinglePDF(rec)}
                    className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition shadow-sm"
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
