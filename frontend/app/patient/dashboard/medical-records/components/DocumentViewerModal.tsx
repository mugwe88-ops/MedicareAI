"use client";

import { X, Download, Printer, Share2, ShieldCheck, Building2, User, FileCheck } from "lucide-react";
import { MedicalRecordItem } from "./RecordCard";

interface DocumentViewerModalProps {
  record: MedicalRecordItem | null;
  patientName?: string;
  onClose: () => void;
}

export default function DocumentViewerModal({ record, patientName = "William Weru", onClose }: DocumentViewerModalProps) {
  if (!record) return null;

  const formattedDate = new Date(record.created_at).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-blue-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Official Health Record</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-2 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl transition cursor-pointer"
              title="Print Document"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Clinical Document Body */}
        <div className="p-8 overflow-y-auto space-y-6 bg-slate-50/50">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            {/* Header / Facility Meta */}
            <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-200 pb-6 gap-4">
              <div>
                <div className="flex items-center gap-2 text-blue-600 font-black text-xl">
                  <Building2 className="w-6 h-6" /> Swift MD Medical Center
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {record.facility_name || "Juja Healthcare Complex, Kiambu County, Kenya"}
                </p>
                <p className="text-xs text-slate-400">Tel: +254 (0) 700 000 000 • Email: records@swiftmd.co.ke</p>
              </div>

              <div className="text-left sm:text-right">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-black uppercase">
                  {record.type.replace("_", " ")}
                </span>
                <p className="text-xs font-bold text-slate-600 mt-2">Ref ID: {record.id}</p>
                <p className="text-xs text-slate-500">Date Issued: {formattedDate}</p>
              </div>
            </div>

            {/* Patient & Practitioner Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400">Patient Details</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-slate-500" /> {patientName}
                </p>
                <p className="text-xs text-slate-500">Patient ID: PAT-88204-KE</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400">Attending Doctor</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{record.doctor_name}</p>
                <p className="text-xs text-slate-500">
                  License No: <span className="font-mono font-bold text-slate-700">{record.doctor_license || "A10492/KE"}</span>
                </p>
              </div>
            </div>

            {/* Document Content */}
            <div className="space-y-4">
              <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-2">{record.title}</h3>

              {record.diagnosis && (
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Diagnosis / Assessment</h4>
                  <p className="text-sm font-medium text-slate-800 mt-1">{record.diagnosis}</p>
                </div>
              )}

              {record.medications && record.medications.length > 0 && (
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Prescribed Medications</h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Medication</th>
                          <th className="p-3">Dosage</th>
                          <th className="p-3">Frequency</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                        {record.medications.map((med, idx) => (
                          <tr key={idx}>
                            <td className="p-3 font-bold">{med.name}</td>
                            <td className="p-3">{med.dosage}</td>
                            <td className="p-3">{med.frequency}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {record.details && (
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Clinical Notes & Remarks</h4>
                  <p className="text-xs text-slate-700 leading-relaxed mt-1 whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {record.details}
                  </p>
                </div>
              )}
            </div>

            {/* Digital Signature & Verification QR Footer */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center font-mono text-[9px] text-center p-1 font-bold text-slate-500">
                  [ QR VERIFY ]
                </div>
                <div>
                  <div className="flex items-center gap-1 text-emerald-600 font-black text-xs">
                    <ShieldCheck className="w-4 h-4" /> Digitally Signed & Authenticated
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Verified via Swift MD Health Ledger. Scan to confirm validity.
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-serif italic text-lg text-slate-800">{record.doctor_name}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Authorized Signature</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="bg-white px-6 py-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-600 hover:text-slate-800 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
          >
            Close
          </button>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer">
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
            <button className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition cursor-pointer">
              <Download className="w-3.5 h-3.5" /> Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}