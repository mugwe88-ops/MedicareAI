"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  CreditCard, 
  DollarSign, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft,
  Receipt,
  ShieldCheck
} from "lucide-react";

interface BillItem {
  id: number;
  service_name: string;
  amount: number;
  status: "pending" | "paid";
  date: string;
  doctor_name?: string;
}

export default function PatientBillingPage() {
  const [bills, setBills] = useState<BillItem[]>([
    {
      id: 1,
      service_name: "General Consultation & Telehealth Room",
      amount: 150.00,
      status: "pending",
      date: "2026-08-26",
      doctor_name: "Dr. Ivan Weru"
    },
    {
      id: 2,
      service_name: "Diagnostic Lab Test Panel",
      amount: 85.50,
      status: "paid",
      date: "2026-08-20",
      doctor_name: "Dr. Ivan Weru"
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const router = useRouter();

  const handlePayBill = (id: number) => {
    setLoading(true);
    setFeedback(null);
    setTimeout(() => {
      setBills(prev => 
        prev.map(bill => bill.id === id ? { ...bill, status: "paid" } : bill)
      );
      setLoading(false);
      setFeedback("Payment processed successfully via secure gateway!");
      setTimeout(() => setFeedback(null), 3000);
    }, 1000);
  };

  const totalPending = bills
    .filter(b => b.status === "pending")
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col">
      {/* Top Header */}
      <header className="bg-slate-900 text-white px-8 py-4 flex justify-between items-center border-b border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push("/patient/dashboard")}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Patient Portal</p>
            <h1 className="text-lg font-bold tracking-tight">Billing & Invoices</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold bg-blue-950/60 text-blue-400 border border-blue-800/60 px-3 py-1.5 rounded-full">
          <ShieldCheck size={16} /> Secure SSL Billing
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl w-full mx-auto px-6 py-8 space-y-8 flex-1">
        {feedback && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm font-medium flex items-center gap-3 shadow-sm animate-in fade-in">
            <CheckCircle size={20} className="text-emerald-600 flex-shrink-0" /> {feedback}
          </div>
        )}

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Outstanding Balance</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">${totalPending.toFixed(2)}</p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <DollarSign size={28} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Invoices</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">
                {bills.filter(b => b.status === "pending").length} Pending
              </p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Receipt size={28} />
            </div>
          </div>
        </div>

        {/* Invoices List Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-900">Invoice History & Payments</h3>
            <span className="text-xs text-slate-500 font-medium">Showing all transactions</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-6 py-3.5 font-bold">Service / Description</th>
                  <th className="px-6 py-3.5 font-bold">Doctor</th>
                  <th className="px-6 py-3.5 font-bold">Date</th>
                  <th className="px-6 py-3.5 font-bold">Amount</th>
                  <th className="px-6 py-3.5 font-bold">Status</th>
                  <th className="px-6 py-3.5 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {bills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {bill.service_name}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{bill.doctor_name || "N/A"}</td>
                    <td className="px-6 py-4 text-slate-500">{bill.date}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">${bill.amount.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                        bill.status === "paid" 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {bill.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {bill.status === "pending" ? (
                        <button
                          onClick={() => handlePayBill(bill.id)}
                          disabled={loading}
                          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-sm disabled:opacity-50"
                        >
                          {loading ? "Processing..." : "Pay Now"}
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400 flex items-center justify-end gap-1">
                          <CheckCircle size={14} className="text-emerald-500" /> Settled
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}