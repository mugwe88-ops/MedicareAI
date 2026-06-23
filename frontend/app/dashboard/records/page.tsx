'use client';

import { useState, useEffect } from "react";
import { FlaskConical } from "lucide-react";

export default function MedicalRecordsPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await fetch("https://medicareai-1.onrender.com/api/records", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        const data = await res.json();
        setRecords(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch medical records", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen text-slate-100">
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tight text-white">Medical Records</h1>
        <p className="text-slate-400 text-sm mt-1">Review historical clinical findings, digital lab reports, and automated diagnostic summaries.</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-slate-400 font-medium text-sm">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          Decrypting personal records matrix...
        </div>
      ) : records.length === 0 ? (
        <div className="bg-slate-900 p-8 rounded-2xl text-center border border-slate-800 max-w-xl shadow-xl py-12">
          <FlaskConical className="w-12 h-12 mx-auto text-slate-700 mb-3" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">No Diagnostic Data</p>
          <p className="text-xs text-slate-500 mt-1">There are currently no biometric or laboratory files linked to this account.</p>
        </div>
      ) : (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          {/* Mapped contents display here */}
        </div>
      )}
    </div>
  );
}