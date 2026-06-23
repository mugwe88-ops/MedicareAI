'use client';

import { useState, useEffect } from "react";

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
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Medical Records</h1>
        <p className="text-gray-600 mt-1">View your clinical history, lab results, and digital prescriptions.</p>
      </div>

      {loading ? (
        <div className="text-gray-500">Loading your health records...</div>
      ) : records.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-sm text-center text-gray-500 border border-gray-100">
          No medical records found.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          {/* Render your records mapping here */}
        </div>
      )}
    </div>
  );
}