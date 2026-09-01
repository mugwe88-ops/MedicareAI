"use client";

import { useState } from "react";
import { DollarSign, TrendingUp, CreditCard, Download, Calendar, ArrowUpRight, CheckCircle2, Clock } from "lucide-react";

interface PayoutTransaction {
  id: string;
  date: string;
  patientName: string;
  consultationType: string;
  amount: string;
  status: "Completed" | "Processing" | "Pending";
}

const transactions: PayoutTransaction[] = [
  {
    id: "TRX-8492",
    date: "Sep 1, 2026",
    patientName: "Sarah Jenkins",
    consultationType: "Video Telehealth (30m)",
    amount: "$150.00",
    status: "Completed",
  },
  {
    id: "TRX-8491",
    date: "Aug 31, 2026",
    patientName: "Michael Chang",
    consultationType: "Follow-up Checkup",
    amount: "$120.00",
    status: "Completed",
  },
  {
    id: "TRX-8490",
    date: "Aug 30, 2026",
    patientName: "Amanda Roberts",
    consultationType: "Initial Consultation",
    amount: "$200.00",
    status: "Processing",
  },
  {
    id: "TRX-8489",
    date: "Aug 28, 2026",
    patientName: "David Miller",
    consultationType: "Telehealth Urgent Care",
    amount: "$175.00",
    status: "Completed",
  },
];

export default function DoctorEarningsPage() {
  const [requested, setRequested] = useState(false);

  const handleRequestPayout = () => {
    setRequested(true);
    setTimeout(() => setRequested(false), 4000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div>
          <span className="text-xs uppercase tracking-wider text-blue-600 font-bold block mb-1">Financial Operations</span>
          <h1 className="text-xl font-extrabold text-gray-900">Earnings & Payments</h1>
          <p className="text-xs text-gray-500 mt-1">Review payout history, consultation fees, and practice financial performance.</p>
        </div>
        <button
          onClick={handleRequestPayout}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2 cursor-pointer"
        >
          <CreditCard size={16} /> Request Payout
        </button>
      </div>

      {requested && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 size={16} /> Payout request submitted successfully! Funds will reflect in your bank account within 1-2 business days.
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-500 uppercase">Available Balance</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">$2,450.00</div>
          <p className="text-[11px] text-green-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp size={12} /> Ready for instant transfer
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-500 uppercase">Total Earned (This Month)</span>
            <div className="p-2 bg-green-50 text-green-600 rounded-xl">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">$8,920.00</div>
          <p className="text-[11px] text-gray-500 mt-1">Across 42 completed sessions</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-500 uppercase">Pending Clearance</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Clock size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">$375.00</div>
          <p className="text-[11px] text-gray-500 mt-1">Clears in 24 hours</p>
        </div>
      </div>

      {/* Transactions Table Section */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-900 text-sm">Recent Consultation Payouts</h3>
          <button className="text-xs font-bold text-blue-600 hover:text-blue-500 flex items-center gap-1">
            <Download size={14} /> Download Statement
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 font-semibold">
                <th className="pb-3">Transaction ID</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Patient Name</th>
                <th className="pb-3">Consultation Type</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50/80 transition">
                  <td className="py-3.5 font-bold text-gray-900">{tx.id}</td>
                  <td className="py-3.5 text-gray-500">{tx.date}</td>
                  <td className="py-3.5 font-medium text-gray-800">{tx.patientName}</td>
                  <td className="py-3.5 text-gray-600">{tx.consultationType}</td>
                  <td className="py-3.5 font-extrabold text-gray-900">{tx.amount}</td>
                  <td className="py-3.5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      tx.status === "Completed"
                        ? "bg-green-50 text-green-700 border border-green-100"
                        : "bg-amber-50 text-amber-700 border border-amber-100"
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${tx.status === "Completed" ? "bg-green-500" : "bg-amber-500"}`} />
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}