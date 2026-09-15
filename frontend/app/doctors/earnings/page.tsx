// frontend/app/doctors/dashboard/earnings/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Wallet,
  TrendingUp,
  Calendar,
  Download,
  Settings,
  RefreshCw,
  ArrowUpRight,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Smartphone,
  Building,
  Target,
  Percent,
  Video,
  PhoneCall,
  MessageSquare,
  Users,
  Sparkles,
  ArrowRight,
  X,
  Lock
} from "lucide-react";

// --- TYPES ---
interface Transaction {
  id: string;
  txId: string;
  date: string;
  patientName: string;
  consultationType: "Video Consultation" | "Audio Consultation" | "Chat Consultation" | "Follow-up";
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  status: "Paid" | "Pending" | "Failed";
}

interface BreakdownItem {
  type: string;
  count: number;
  amount: number;
  percentage: number;
  icon: any;
}

export default function EarningsPage() {
  const router = useRouter();

  // --- STATE ---
  const [loading, setLoading] = useState<boolean>(true);
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "3m" | "12m">("30d");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState<boolean>(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>("45250");
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState<boolean>(false);

  // --- MOCK FETCH ---
  useEffect(() => {
    const fetchEarningsData = async () => {
      setLoading(true);
      try {
        // Simulating API latency
        await new Promise((r) => setTimeout(r, 800));

        const mockTransactions: Transaction[] = [
          {
            id: "tx-1",
            txId: "MPESA-QZX9812",
            date: "Today, 2:15 PM",
            patientName: "Eunice Wangari",
            consultationType: "Video Consultation",
            grossAmount: 1500,
            platformFee: 150,
            netAmount: 1350,
            status: "Paid"
          },
          {
            id: "tx-2",
            txId: "MPESA-QZX7741",
            date: "Yesterday, 11:30 AM",
            patientName: "Brian Kiprono",
            consultationType: "Audio Consultation",
            grossAmount: 1200,
            platformFee: 120,
            netAmount: 1080,
            status: "Paid"
          },
          {
            id: "tx-3",
            txId: "MPESA-QZX6209",
            date: "16 Sept, 4:00 PM",
            patientName: "Amina Abdi",
            consultationType: "Follow-up",
            grossAmount: 1000,
            platformFee: 100,
            netAmount: 900,
            status: "Pending"
          },
          {
            id: "tx-4",
            txId: "MPESA-QZX5188",
            date: "14 Sept, 9:20 AM",
            patientName: "David Ochieng",
            consultationType: "Chat Consultation",
            grossAmount: 800,
            platformFee: 80,
            netAmount: 720,
            status: "Paid"
          },
          {
            id: "tx-5",
            txId: "MPESA-QZX4012",
            date: "12 Sept, 1:45 PM",
            patientName: "Grace Muthoni",
            consultationType: "Video Consultation",
            grossAmount: 1500,
            platformFee: 150,
            netAmount: 1350,
            status: "Failed"
          }
        ];

        setTransactions(mockTransactions);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };

    fetchEarningsData();
  }, []);

  // --- FINANCIAL CALCULATIONS ---
  const availableBalance = 45250; // KSh
  const totalEarnings = 348900;
  const thisMonthEarnings = 94200;
  const pendingPayouts = 18400;
  const monthlyGoal = 120000;
  const goalProgress = Math.min(100, Math.round((thisMonthEarnings / monthlyGoal) * 100));

  // Consultation Breakdown Calculations
  const breakdownItems: BreakdownItem[] = useMemo(() => [
    { type: "Video Consultations", count: 42, amount: 63000, percentage: 65, icon: Video },
    { type: "Audio Consultations", count: 18, amount: 21600, percentage: 22, icon: PhoneCall },
    { type: "Chat Consultations", count: 12, amount: 9600, percentage: 10, icon: MessageSquare },
    { type: "Follow-ups", count: 5, amount: 3000, percentage: 3, icon: Users },
  ], []);

  // Handle M-Pesa Instant Withdrawal
  const handleInstantWithdraw = () => {
    setIsWithdrawing(true);
    setTimeout(() => {
      setIsWithdrawing(false);
      setWithdrawSuccess(true);
      setTimeout(() => {
        setWithdrawSuccess(false);
        setIsWithdrawModalOpen(false);
      }, 2500);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 md:p-8 font-sans pb-24">
      
      {/* ================= 1. HEADER & NEXT PAYOUT INFO ================= */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-600 text-white rounded-xl shadow-md shadow-emerald-600/30">
                <Wallet size={22} />
              </span>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Earnings & Payouts</h1>
            </div>
            <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <Clock size={12} /> Next payout: Friday, 18 Sept • M-Pesa ending in 4321
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsWithdrawModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition cursor-pointer active:scale-95"
            >
              <ArrowUpRight size={15} />
              <span>Withdraw Funds</span>
            </button>

            <button
              onClick={() => alert("Downloading tax-ready monthly statement as PDF...")}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-sm transition cursor-pointer"
            >
              <Download size={14} />
              <span>Download Statement</span>
            </button>

            <button
              onClick={() => router.push("/doctors/dashboard/settings")}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-sm transition cursor-pointer"
            >
              <Settings size={14} />
              <span>Payment Settings</span>
            </button>
          </div>
        </div>

        {/* HIGHEST PRIORITY ADDITION: EARNINGS COMMAND CENTER */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white p-5 rounded-3xl shadow-xl border border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center lg:text-left">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-400 flex items-center justify-center lg:justify-start gap-1.5">
              <Sparkles size={13} /> Earnings Command Center
            </span>
            <div className="flex items-baseline justify-center lg:justify-start gap-3">
              <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
                KSh {availableBalance.toLocaleString()}
              </h2>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-800">
                Ready for Instant Payout
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Arrives in your M-Pesa within seconds • Zero transfer fees for tier-1 verified accounts.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 w-full lg:w-auto">
            <div className="bg-slate-900/90 px-4 py-2.5 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Today's Earnings</span>
              <strong className="text-sm font-black text-white block mt-0.5">KSh 3,450</strong>
            </div>

            <div className="bg-slate-900/90 px-4 py-2.5 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase">This Month</span>
              <strong className="text-sm font-black text-emerald-400 block mt-0.5">KSh {thisMonthEarnings.toLocaleString()}</strong>
            </div>

            <button
              onClick={() => setIsWithdrawModalOpen(true)}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition cursor-pointer active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Withdraw Now</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ================= 2. FINANCIAL SUMMARY CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Available Balance</span>
            <h3 className="text-2xl font-black text-emerald-600 tracking-tight">KSh {availableBalance.toLocaleString()}</h3>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
              Ready for withdrawal
            </span>
          </div>
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl shadow-inner">
            <Wallet size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Earnings</span>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">KSh {totalEarnings.toLocaleString()}</h3>
            <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md inline-block">
              Lifetime revenue
            </span>
          </div>
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl shadow-inner">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">This Month</span>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">KSh {thisMonthEarnings.toLocaleString()}</h3>
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
              +18% vs last month
            </span>
          </div>
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl shadow-inner">
            <Calendar size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Payouts</span>
            <h3 className="text-2xl font-black text-amber-600 tracking-tight">KSh {pendingPayouts.toLocaleString()}</h3>
            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md inline-block">
              Processing in 2 days
            </span>
          </div>
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl shadow-inner">
            <Clock size={24} />
          </div>
        </div>
      </div>

      {/* ================= 3 & 7. EARNINGS CHART & PAYMENT INSIGHTS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Earnings Chart Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Earnings Performance Trend</h3>
              <p className="text-xs text-slate-500">Visualizing revenue growth across daily, weekly, and monthly periods.</p>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {(["7d", "30d", "3m", "12m"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                    timeframe === t 
                      ? "bg-white text-slate-900 shadow-sm" 
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {t === "7d" ? "7 Days" : t === "30d" ? "30 Days" : t === "3m" ? "3 Months" : "12 Months"}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive SVG Bar Chart Representation */}
          <div className="h-56 w-full flex items-end justify-between gap-2 pt-6 px-2 border-b border-slate-100">
            {[
              { label: "Mon", val: 8500, height: "45%" },
              { label: "Tue", val: 12400, height: "65%" },
              { label: "Wed", val: 19800, height: "95%" },
              { label: "Thu", val: 14200, height: "72%" },
              { label: "Fri", val: 16500, height: "80%" },
              { label: "Sat", val: 11000, height: "55%" },
              { label: "Sun", val: 7500, height: "38%" },
            ].map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="opacity-0 group-hover:opacity-100 transition text-[10px] font-extrabold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded shadow">
                  KSh {bar.val.toLocaleString()}
                </div>
                <div 
                  style={{ height: bar.height }} 
                  className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-xl group-hover:from-emerald-500 group-hover:to-emerald-300 transition-all duration-300 shadow-md"
                />
                <span className="text-[11px] font-bold text-slate-400">{bar.label}</span>
              </div>
            ))}
          </div>

          {/* Goal Tracker Footer Card */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700 flex items-center gap-1.5">
                <Target size={14} className="text-emerald-600" /> Monthly Earnings Goal (KSh {monthlyGoal.toLocaleString()})
              </span>
              <span className="text-emerald-600">{goalProgress}% Achieved</span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div style={{ width: `${goalProgress}%` }} className="h-full bg-emerald-500 rounded-full transition-all duration-500" />
            </div>
            <p className="text-[11px] text-slate-500">
              You are <strong className="text-slate-900">KSh {(monthlyGoal - thisMonthEarnings).toLocaleString()}</strong> away from your monthly target.
            </p>
          </div>
        </div>

        {/* Payment Insights & Consultation Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 mb-1">Revenue Insights</h3>
            <p className="text-xs text-slate-500">Key analytics driving your clinical income.</p>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-2xl space-y-1">
              <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider flex items-center gap-1">
                <Sparkles size={12} /> Average Consultation
              </span>
              <p className="text-xs font-semibold text-slate-700">
                "Your average consultation earned <strong className="text-slate-900">KSh 1,250</strong>."
              </p>
            </div>

            <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl space-y-1">
              <span className="text-[10px] font-black uppercase text-blue-800 tracking-wider flex items-center gap-1">
                <TrendingUp size={12} /> Monthly Growth
              </span>
              <p className="text-xs font-semibold text-slate-700">
                "Your earnings increased <strong className="text-slate-900">18%</strong> compared to last month."
              </p>
            </div>
          </div>

          {/* Consultation Type Breakdown */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Earnings by Service Type</h4>
            <div className="space-y-2.5">
              {breakdownItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-700 flex items-center gap-1.5">
                        <Icon size={14} className="text-emerald-600" /> {item.type}
                      </span>
                      <span className="text-slate-900">KSh {item.amount.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div style={{ width: `${item.percentage}%` }} className="h-full bg-emerald-500 rounded-full" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* ================= 6. WITHDRAWAL SECTION BANNER ================= */}
      <div className="mb-6 bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-950 text-white p-6 rounded-3xl shadow-xl border border-emerald-800/60 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg">
            <Smartphone size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="font-black text-base text-white flex items-center gap-2">
              Primary Payout Method: M-Pesa <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">Instant</span>
            </h3>
            <p className="text-xs text-slate-300">
              Minimum withdrawal: KSh 500 • Estimated transfer time: Immediate (&lt; 30 seconds). Secondary Bank Transfer available in settings.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsWithdrawModalOpen(true)}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition cursor-pointer active:scale-95 whitespace-nowrap flex items-center gap-2"
        >
          <Wallet size={16} />
          <span>Withdraw Now</span>
        </button>
      </div>

      {/* ================= 4 & 8. IMPROVED PAYOUT HISTORY TABLE ================= */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">Payout & Consultation History</h3>
            <p className="text-xs text-slate-500">Detailed transaction ledger with platform fee transparency.</p>
          </div>

          <button
            onClick={() => alert("Filtering transaction ledger...")}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Filter Ledger
          </button>
        </div>

        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="w-full h-12 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-black uppercase text-slate-400 border-b border-slate-200">
                  <th className="py-3.5 px-4">Transaction ID</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Patient (Privacy Protected)</th>
                  <th className="py-3.5 px-4">Consultation Type</th>
                  <th className="py-3.5 px-4">Gross</th>
                  <th className="py-3.5 px-4">Platform Fee</th>
                  <th className="py-3.5 px-4">Final Payout</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-4 font-mono font-bold text-slate-900">{tx.txId}</td>
                    <td className="py-4 px-4 text-slate-500">{tx.date}</td>
                    <td className="py-4 px-4 font-bold text-slate-800">{tx.patientName}</td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-[11px] font-bold text-slate-700">
                        {tx.consultationType}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-600">KSh {tx.grossAmount.toLocaleString()}</td>
                    <td className="py-4 px-4 text-rose-600">-KSh {tx.platformFee}</td>
                    <td className="py-4 px-4 font-black text-slate-900">KSh {tx.netAmount.toLocaleString()}</td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        tx.status === "Paid"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : tx.status === "Pending"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}>
                        {tx.status === "Paid" && <CheckCircle2 size={12} />}
                        {tx.status === "Pending" && <Clock size={12} />}
                        {tx.status === "Failed" && <XCircle size={12} />}
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* ================= 8. BETTER EMPTY STATE ================= */
          <div className="p-12 text-center space-y-4 max-w-md mx-auto my-8">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Wallet size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-lg text-slate-900">No payouts yet</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Complete your first consultation to start earning. Assigned appointments will reflect earnings here automatically.
              </p>
            </div>
            <button
              onClick={() => router.push("/doctors/dashboard/appointments")}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/30 transition cursor-pointer"
            >
              View Appointments
            </button>
          </div>
        )}
      </div>

      {/* ================= WITHDRAWAL MODAL ================= */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-6 animate-in zoom-in-95 duration-200 border border-slate-100">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Smartphone size={20} />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">Instant M-Pesa Withdrawal</h3>
                  <p className="text-[11px] text-slate-500">Transfer funds directly to your registered phone.</p>
                </div>
              </div>
              <button
                onClick={() => setIsWithdrawModalOpen(false)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition"
              >
                <X size={16} />
              </button>
            </div>

            {withdrawSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="font-extrabold text-lg text-slate-900">Transfer Successful!</h4>
                <p className="text-xs text-slate-500">
                  KSh {Number(withdrawAmount).toLocaleString()} has been sent to your M-Pesa number ending in 4321.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Available Balance</span>
                  <strong className="text-xl font-black text-slate-900">KSh {availableBalance.toLocaleString()}</strong>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Withdrawal Amount (KSh)</label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/25 focus:border-emerald-600 transition"
                  />
                  <span className="text-[10px] text-slate-400">Zero transaction fees applicable. Instant push to phone.</span>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[11px] font-medium text-blue-900 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-blue-600 flex-shrink-0" />
                  <span>Protected by Swift MD Secure Escrow & 256-bit encryption.</span>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setIsWithdrawModalOpen(false)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleInstantWithdraw}
                    disabled={isWithdrawing}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isWithdrawing ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Processing M-Pesa...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm Transfer</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}