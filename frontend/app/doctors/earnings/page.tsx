"use client";

import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, Clock, Download, RefreshCw } from "lucide-react";

interface Payout {
  id: number;
  transaction_id: string;
  date: string;
  patient_name: string;
  consultation_type: string;
  amount: number;
  status: string;
}

interface EarningsData {
  availableBalance: number;
  totalEarned: number;
  pendingClearance: number;
  completedSessions: number;
  payouts: Payout[];
}

export default function DoctorEarningsPage() {
  const [data, setData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEarnings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/doctors/earnings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load earnings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      <div className="flex justify-between items-center bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div>
          <span className="text-xs uppercase tracking-wider text-blue-600 font-bold block mb-1">Financial Operations</span>
          <h1 className="text-xl font-extrabold text-gray-900">Earnings & Payments</h1>
          <p className="text-xs text-gray-500 mt-1">Review payout history, consultation fees, and practice financial performance.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchEarnings} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow transition cursor-pointer">
            Request Payout
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <span className="text-xs text-gray-400 font-bold block uppercase mb-1">Available Balance</span>
          <h2 className="text-2xl font-black text-gray-900">${Number(data?.availableBalance || 0).toLocaleString()}</h2>
          <span className="text-[11px] text-green-600 font-semibold mt-2 block">✓ Ready for instant transfer</span>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <span className="text-xs text-gray-400 font-bold block uppercase mb-1">Total Earned (This Month)</span>
          <h2 className="text-2xl font-black text-gray-900">${Number(data?.totalEarned || 0).toLocaleString()}</h2>
          <span className="text-[11px] text-gray-500 mt-2 block">Across {data?.completedSessions || 0} completed sessions</span>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <span className="text-xs text-gray-400 font-bold block uppercase mb-1">Pending Clearance</span>
          <h2 className="text-2xl font-black text-gray-900">${Number(data?.pendingClearance || 0).toLocaleString()}</h2>
          <span className="text-[11px] text-amber-600 font-semibold mt-2 block">Clears in 24 hours</span>
        </div>
      </div>

      {/* Recent Payouts Table */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Recent Consultation Payouts</h3>
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-gray-100 text-gray-400 uppercase">
              <th className="pb-3">Transaction ID</th>
              <th className="pb-3">Date</th>
              <th className="pb-3">Patient Name</th>
              <th className="pb-3">Consultation Type</th>
              <th className="pb-3">Amount</th>
              <th className="pb-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={6} className="py-6 text-center text-gray-400 font-bold">Loading live transactions...</td></tr>
            ) : data?.payouts?.length === 0 ? (
              <tr><td colSpan={6} className="py-6 text-center text-gray-400 font-bold">No payouts recorded yet.</td></tr>
            ) : (
              data?.payouts?.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="py-3 font-bold text-gray-900">{p.transaction_id}</td>
                  <td className="py-3 text-gray-500">{p.date}</td>
                  <td className="py-3 font-semibold text-gray-800">{p.patient_name}</td>
                  <td className="py-3 text-gray-500">{p.consultation_type}</td>
                  <td className="py-3 font-extrabold text-gray-900">${Number(p.amount).toFixed(2)}</td>
                  <td className="py-3 text-right font-bold text-green-600">{p.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}