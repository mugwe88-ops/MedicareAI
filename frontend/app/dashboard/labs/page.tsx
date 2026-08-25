"use client";
import { useState, useEffect } from "react";
import { FlaskConical, Download, Calendar, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface LabTest {
  id: number;
  testName: string;
  orderedBy: string;
  dateOrdered: string;
  status: "Completed" | "Pending" | "Processing";
  results?: string;
  referenceRange?: string;
}

export default function LabTestsPage() {
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch or simulate patient lab test records
    setTimeout(() => {
      setLabTests([
        {
          id: 1,
          testName: "Complete Blood Count (CBC)",
          orderedBy: "Dr. Sarah Jenkins",
          dateOrdered: "August 20, 2026",
          status: "Completed",
          results: "WBC: 6.5 x10^3/µL, RBC: 4.8 x10^6/µL, Hemoglobin: 14.2 g/dL",
          referenceRange: "Normal across all parameters"
        },
        {
          id: 2,
          testName: "Lipid Panel & Cholesterol",
          orderedBy: "Dr. Michael Mugwe",
          dateOrdered: "August 18, 2026",
          status: "Completed",
          results: "Total Cholesterol: 180 mg/dL, HDL: 55 mg/dL, LDL: 110 mg/dL",
          referenceRange: "Optimal Levels"
        },
        {
          id: 3,
          testName: "Thyroid Stimulating Hormone (TSH)",
          orderedBy: "Dr. Sarah Jenkins",
          dateOrdered: "August 25, 2026",
          status: "Processing",
          results: "Sample received at laboratory, analysis underway.",
          referenceRange: "Pending"
        }
      ]);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div className="p-4 sm:p-8 bg-slate-950 min-h-screen text-slate-100 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <FlaskConical className="text-blue-500" size={32} />
            Lab Tests & Diagnostics
          </h1>
          <p className="text-slate-400 text-sm font-semibold mt-1">
            Track your diagnostic investigations, sample status, and laboratory result reports
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 font-bold">
            Loading laboratory records...
          </div>
        ) : labTests.length === 0 ? (
          <div className="p-12 text-center text-slate-400 font-medium bg-slate-900 rounded-3xl border border-slate-800">
            No lab tests found on file.
          </div>
        ) : (
          <div className="space-y-6">
            {labTests.map((test) => (
              <div
                key={test.id}
                className="bg-slate-900 rounded-3xl border border-slate-800 p-8 shadow-sm space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                      <FlaskConical size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-white">{test.testName}</h2>
                      <p className="text-xs text-blue-400 font-bold mt-0.5">Ordered by {test.orderedBy}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                      test.status === "Completed" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                      "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}>
                      {test.status === "Completed" ? <CheckCircle size={14} /> : <Clock size={14} />}
                      {test.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">Test Findings / Status</p>
                    <p className="text-sm font-medium text-slate-200">{test.results}</p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">Reference Evaluation</p>
                    <p className="text-sm font-bold text-blue-300">{test.referenceRange}</p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                    <Calendar size={14} /> Ordered on {test.dateOrdered}
                  </span>
                  {test.status === "Completed" && (
                    <button
                      onClick={() => alert("Downloading laboratory report PDF...")}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-2 shadow-md shadow-blue-600/20"
                    >
                      <Download size={14} /> Download Lab Report
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}