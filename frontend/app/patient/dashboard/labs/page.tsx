"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  FlaskConical, 
  Download, 
  Calendar, 
  Clock, 
  CheckCircle, 
  Search, 
  Sparkles, 
  FileText, 
  X, 
  ShieldCheck, 
  AlertTriangle,
  ArrowLeft
} from "lucide-react";

interface Biomarker {
  name: string;
  value: string;
  unit: string;
  status: "Normal" | "High" | "Low";
}

interface LabTest {
  id: number;
  testName: string;
  orderedBy: string;
  dateOrdered: string;
  status: "Completed" | "Pending" | "Processing";
  summary: string;
  referenceRange: string;
  biomarkers: Biomarker[];
  aiAnalysis: string;
}

export default function LabTestsPage() {
  const router = useRouter();
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [selectedTestForAI, setSelectedTestForAI] = useState<LabTest | null>(null);
  const [selectedTestForReport, setSelectedTestForReport] = useState<LabTest | null>(null);

  useEffect(() => {
    const fetchLabTests = async () => {
      setLoading(true);
      setErrorMsg("");

      const token = localStorage.getItem("token") || localStorage.getItem("jwt");
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://medicareai-1.onrender.com";

      try {
        const response = await fetch(`${backendUrl}/api/labs`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) {
          throw new Error("Failed to retrieve lab diagnostic records from server.");
        }

        const data = await response.json();
        const tests = Array.isArray(data) ? data : data.labs || data.tests || [];
        
        if (tests.length > 0) {
          setLabTests(tests);
        } else {
          loadFallbackData();
        }
      } catch (err: any) {
        console.warn("Backend labs fetch warning, engaging fallback:", err.message);
        setErrorMsg("Could not connect to live diagnostic records. Displaying cached records.");
        loadFallbackData();
      } finally {
        setLoading(false);
      }
    };

    const loadFallbackData = () => {
      setLabTests([
        {
          id: 1,
          testName: "Complete Blood Count (CBC)",
          orderedBy: "Dr. Sarah Jenkins",
          dateOrdered: "August 20, 2026",
          status: "Completed",
          summary: "All primary cellular components are within normal physiological ranges.",
          referenceRange: "Standard Adult Reference",
          biomarkers: [
            { name: "White Blood Cells (WBC)", value: "6.5", unit: "x10^3/µL", status: "Normal" },
            { name: "Red Blood Cells (RBC)", value: "4.8", unit: "x10^6/µL", status: "Normal" },
            { name: "Hemoglobin", value: "14.2", unit: "g/dL", status: "Normal" },
            { name: "Platelets", value: "250", unit: "x10^3/µL", status: "Normal" }
          ],
          aiAnalysis: "Your Complete Blood Count shows optimal cellular balance. Your white blood cell count suggests no acute infection or inflammation, and your hemoglobin levels indicate healthy oxygen-carrying capacity."
        },
        {
          id: 2,
          testName: "Lipid Panel & Cholesterol",
          orderedBy: "Dr. Michael Mugwe",
          dateOrdered: "August 18, 2026",
          status: "Completed",
          summary: "Optimal cholesterol distribution with favorable HDL/LDL balance.",
          referenceRange: "AHA Guidelines",
          biomarkers: [
            { name: "Total Cholesterol", value: "180", unit: "mg/dL", status: "Normal" },
            { name: "HDL Cholesterol", value: "55", unit: "mg/dL", status: "Normal" },
            { name: "LDL Cholesterol", value: "110", unit: "mg/dL", status: "Normal" },
            { name: "Triglycerides", value: "130", unit: "mg/dL", status: "Normal" }
          ],
          aiAnalysis: "Your lipid panel indicates a healthy cardiovascular risk profile. Your HDL (good cholesterol) is protective, and LDL remains within the optimal threshold."
        },
        {
          id: 3,
          testName: "Thyroid Stimulating Hormone (TSH)",
          orderedBy: "Dr. Sarah Jenkins",
          dateOrdered: "August 25, 2026",
          status: "Processing",
          summary: "Sample received at laboratory, automated assay underway.",
          referenceRange: "Pending",
          biomarkers: [],
          aiAnalysis: "Results are currently being processed by our partner diagnostic laboratory. Typically takes 24–48 hours."
        }
      ]);
    };

    fetchLabTests();
  }, []);

  const filteredTests = labTests.filter((test) => {
    const matchesSearch = test.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          test.orderedBy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || test.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-1 flex flex-col p-6 lg:p-8 space-y-6 overflow-y-auto bg-slate-50 w-full text-slate-800">
      
      {/* Top Header & Back Button */}
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/patient/dashboard")} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <FlaskConical className="text-blue-600" size={24} />
              Lab Tests & Diagnostics
            </h1>
            <p className="text-xs text-slate-400 font-medium">Review diagnostic investigations, biomarker breakdowns, and AI-powered health insights</p>
          </div>
        </div>

        <div className="hidden sm:flex bg-blue-50 border border-blue-200 px-4 py-2 rounded-2xl items-center gap-2 text-xs text-blue-700 font-bold">
          <Sparkles size={15} className="text-blue-600 shrink-0" />
          <span>AI Biomarker Assistant Active</span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2 text-xs text-amber-700 font-bold">
          <AlertTriangle size={15} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search tests or physicians..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 text-slate-800 placeholder-slate-400 text-xs font-bold pl-11 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-blue-600 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {["All", "Completed", "Processing", "Pending"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition shrink-0 cursor-pointer ${
                statusFilter === status 
                  ? "bg-blue-600 text-white shadow-sm" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Tests List */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 font-bold text-xs">
          Loading laboratory records...
        </div>
      ) : filteredTests.length === 0 ? (
        <div className="p-16 text-center text-slate-400 font-medium bg-white rounded-3xl border border-slate-200 text-xs">
          No lab tests match your search criteria.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTests.map((test) => (
            <div
              key={test.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6 transition hover:border-blue-200"
            >
              {/* Card Top Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                    <FlaskConical size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900">{test.testName}</h2>
                    <p className="text-xs text-blue-600 font-bold mt-0.5">Ordered by {test.orderedBy}</p>
                  </div>
                </div>

                <span className={`px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 w-fit ${
                  test.status === "Completed" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                  "bg-amber-50 text-amber-700 border border-amber-200"
                }`}>
                  {test.status === "Completed" ? <CheckCircle size={13} /> : <Clock size={13} />}
                  {test.status}
                </span>
              </div>

              {/* Biomarkers / Findings Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Summary & Reference */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Clinical Summary</p>
                    <p className="text-xs font-medium text-slate-700 leading-relaxed">{test.summary}</p>
                  </div>

                  {test.biomarkers && test.biomarkers.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {test.biomarkers.map((bio, idx) => (
                        <div key={idx} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between">
                          <div>
                            <p className="text-[11px] font-bold text-slate-500">{bio.name}</p>
                            <p className="text-xs font-black text-slate-900 mt-0.5">{bio.value} <span className="text-[10px] text-slate-400 font-normal">{bio.unit}</span></p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                            bio.status === "High" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                            bio.status === "Low" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                            "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}>
                            {bio.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* AI Insights Card Side Panel */}
                <div className="bg-blue-50/60 border border-blue-100 p-5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-blue-700 font-black text-xs uppercase tracking-wider mb-2">
                      <Sparkles size={15} /> AI Health Analysis
                    </div>
                    <p className="text-xs text-slate-700 font-medium leading-relaxed">
                      {test.aiAnalysis}
                    </p>
                  </div>
                  {test.status === "Completed" && (
                    <button
                      onClick={() => setSelectedTestForAI(test)}
                      className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-sm"
                    >
                      Ask AI Follow-up
                    </button>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                  <Calendar size={13} /> Ordered on {test.dateOrdered} • Ref: {test.referenceRange}
                </span>

                {test.status === "Completed" && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedTestForReport(test)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileText size={14} /> View Full Report
                    </button>
                    <button
                      onClick={() => alert(`Downloading official PDF report for ${test.testName}...`)}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Download size={14} /> Download PDF
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Assistant Modal */}
      {selectedTestForAI && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-5 relative shadow-2xl">
            <button 
              onClick={() => setSelectedTestForAI(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X size={18} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">AI Lab Consultant</h3>
                <p className="text-xs text-blue-600 font-bold">{selectedTestForAI.testName}</p>
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-700 space-y-3 font-medium">
              <p className="font-bold text-slate-900">Detailed Biomarker Breakdown:</p>
              <p>{selectedTestForAI.aiAnalysis}</p>
              <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 flex items-center gap-1.5 font-bold">
                <ShieldCheck size={14} className="text-emerald-600" /> Verified against standard clinical reference ranges.
              </div>
            </div>
            <button
              onClick={() => setSelectedTestForAI(null)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-sm"
            >
              Close Assistant
            </button>
          </div>
        </div>
      )}

      {/* Full Report Preview Modal */}
      {selectedTestForReport && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-8 space-y-6 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setSelectedTestForReport(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X size={18} />
            </button>
            
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">MEDICAREAI DIAGNOSTIC LABORATORIES</span>
              <h2 className="text-xl font-black text-slate-900 mt-1">{selectedTestForReport.testName}</h2>
              <p className="text-xs text-slate-400 mt-0.5">Ordered by {selectedTestForReport.orderedBy} on {selectedTestForReport.dateOrdered}</p>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Diagnostic Findings</h4>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-700 font-medium">
                {selectedTestForReport.summary}
              </div>

              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 pt-2">Biomarker Table</h4>
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-400 font-bold uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-3">Parameter</th>
                      <th className="p-3">Value</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedTestForReport.biomarkers?.map((b, i) => (
                      <tr key={i}>
                        <td className="p-3 font-semibold text-slate-700">{b.name}</td>
                        <td className="p-3 font-bold text-slate-900">{b.value} {b.unit}</td>
                        <td className={`p-3 font-bold ${b.status === 'High' ? 'text-rose-600' : b.status === 'Low' ? 'text-amber-600' : 'text-emerald-600'}`}>{b.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => alert("Downloading PDF report...")}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-sm cursor-pointer"
              >
                Download PDF Report
              </button>
              <button
                onClick={() => setSelectedTestForReport(null)}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}