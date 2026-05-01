"use client";
import React, { useEffect, useState } from "react";
import { FileText, AlertTriangle, CheckCircle2, Beaker, Video } from "lucide-react";
import { useRouter } from "next/navigation";

interface LabResult {
  id: string;
  parameter_name: string;
  result_value: string;
  unit: string;
  reference_range: string;
  is_abnormal: boolean;
  reported_at: string;
  lab_notes: string;
}

export default function PatientResultsTable() {
  const [results, setResults] = useState<LabResult[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lab/results/my-results`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setResults(data);
        }
      } catch (error) {
        console.error("Failed to load results:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const handleRequestConsult = (resultId: string) => {
    // Navigate to your telehealth booking page with the result ID context
    router.push(`/telehealth/book?context=${resultId}`);
  };

  if (loading) return <div className="p-8 text-center animate-pulse font-bold text-slate-400">Loading Medical Records...</div>;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
            <Beaker size={20} />
          </div>
          <h2 className="font-black uppercase tracking-tight text-slate-800 text-sm">Laboratory Reports</h2>
        </div>
        <span className="text-[10px] font-black bg-white px-3 py-1 rounded-full border border-slate-200 text-slate-500 uppercase">
          {results.length} Records
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/30">
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Action</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Parameter</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Result</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {results.map((report) => (
              <tr key={report.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="p-4 w-10">
                  {report.is_abnormal && (
                    <button
                      onClick={() => handleRequestConsult(report.id)}
                      className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl transition-all shadow-md shadow-blue-200"
                      title="Request Telehealth Consultation"
                    >
                      <Video size={14} />
                      <span className="text-[10px] font-black uppercase whitespace-nowrap">Talk to Doctor</span>
                    </button>
                  )}
                </td>
                <td className="p-4 text-xs font-bold text-slate-500">
                  {new Date(report.reported_at).toLocaleDateString('en-KE', { day: '2-digit', month: 'short' })}
                </td>
                <td className="p-4">
                  <p className="font-black text-slate-800 text-sm">{report.parameter_name}</p>
                </td>
                <td className="p-4">
                  <span className={`text-sm font-black ${report.is_abnormal ? "text-red-600" : "text-blue-600"}`}>
                    {report.result_value}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 ml-1 uppercase">{report.unit}</span>
                </td>
                <td className="p-4">
                  {report.is_abnormal ? (
                    <div className="flex items-center space-x-1 text-red-600">
                      <AlertTriangle size={12} />
                      <span className="text-[10px] font-black uppercase">Critical</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-green-600">
                      <CheckCircle2 size={12} />
                      <span className="text-[10px] font-black uppercase">Normal</span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}