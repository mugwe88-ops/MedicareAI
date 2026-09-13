"use client";

import { Eye, Download, Share2, CheckCircle2, Pill, FlaskConical, FileText, ShieldCheck, Stethoscope, AlertCircle, Activity } from "lucide-react";

export interface MedicalRecordItem {
  id: string;
  type: "prescription" | "lab_result" | "clinical_note" | "vaccination" | "sick_leave" | "allergy" | "vital";
  title: string;
  doctor_name: string;
  doctor_license?: string;
  facility_name: string;
  created_at: string;
  is_verified: boolean;
  diagnosis?: string;
  details?: string;
  pdf_url?: string;
  medications?: Array<{ name: string; dosage: string; frequency: string }>;
  qr_code_data?: string;
}

interface RecordCardProps {
  record: MedicalRecordItem;
  onView: (record: MedicalRecordItem) => void;
  onDownload: (record: MedicalRecordItem) => void;
  onShare: (record: MedicalRecordItem) => void;
}

const TYPE_CONFIG = {
  prescription: { label: "Prescription", icon: Pill, color: "bg-amber-50 text-amber-700 border-amber-200" },
  lab_result: { label: "Lab Result", icon: FlaskConical, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  clinical_note: { label: "Clinical Note", icon: FileText, color: "bg-blue-50 text-blue-700 border-blue-200" },
  vaccination: { label: "Vaccine Certificate", icon: ShieldCheck, color: "bg-purple-50 text-purple-700 border-purple-200" },
  sick_leave: { label: "Medical Certificate", icon: Stethoscope, color: "bg-rose-50 text-rose-700 border-rose-200" },
  allergy: { label: "Allergy Record", icon: AlertCircle, color: "bg-orange-50 text-orange-700 border-orange-200" },
  vital: { label: "Vitals Log", icon: Activity, color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
};

export default function RecordCard({ record, onView, onDownload, onShare }: RecordCardProps) {
  const config = TYPE_CONFIG[record.type] || TYPE_CONFIG.clinical_note;
  const Icon = config.icon;

  const formattedDate = new Date(record.created_at).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl border ${config.color} shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                {config.label}
              </span>
              {record.is_verified && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-black">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                </span>
              )}
            </div>
            <h3 className="text-base font-black text-slate-900 leading-snug mt-0.5">{record.title}</h3>
            <p className="text-xs font-medium text-slate-500">
              Issued by <span className="font-bold text-slate-800">{record.doctor_name}</span> • {formattedDate}
            </p>
          </div>
        </div>
      </div>

      {record.diagnosis && (
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Diagnosis / Note</p>
          <p className="text-xs font-semibold text-slate-700 line-clamp-2 mt-0.5">{record.diagnosis}</p>
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
        <button
          onClick={() => onView(record)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-xl transition cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" /> View
        </button>
        <button
          onClick={() => onDownload(record)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-100 px-3 py-2 rounded-xl transition cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" /> PDF
        </button>
        <button
          onClick={() => onShare(record)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-100 px-3 py-2 rounded-xl transition cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" /> Share
        </button>
      </div>
    </div>
  );
}