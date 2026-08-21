"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Pill,
  Plus,
  Search,
  User,
  Calendar,
  AlertCircle,
  CheckCircle2,
  X,
  FileText,
} from "lucide-react";

interface Prescription {
  id: number;
  patient_name: string;
  patient_id?: number;
  medication: string;
  dosage: string;
  instructions: string;
  duration?: string;
  created_at?: string;
  doctor_name?: string;
}

interface Patient {
  id: number;
  name: string;
  email?: string;
}

export default function DoctorPrescriptionsPage() {
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    patient_id: "",
    medication: "",
    dosage: "",
    instructions: "",
    duration: "7 days",
  });

  useEffect(() => {
    fetchPrescriptions();
    fetchPatients();
  }, []);

  const fetchPrescriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch("https://medicareai-1.onrender.com/api/doctor/prescriptions", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error(`Server returned status ${res.status}`);
      const data = await res.json();
      setPrescriptions(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to load prescriptions:", err);
      setError("Unable to retrieve prescriptions. Please verify your connection.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch("https://medicareai-1.onrender.com/api/patients", {
        headers: {
          Authorization: `Bearer ${token || ""}`,
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setPatients(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to load patients list:", err);
    }
  };

  const handleCreatePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    if (!formData.patient_id) {
      setFormError("Please select a target patient.");
      setSubmitting(false);
      return;
    }

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const res = await fetch("https://medicareai-1.onrender.com/api/doctor/prescriptions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token || ""}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.details || "Failed to create prescription.");
      }

      setIsModalOpen(false);
      setFormData({
        patient_id: "",
        medication: "",
        dosage: "",
        instructions: "",
        duration: "7 days",
      });
      await fetchPrescriptions();
    } catch (err: any) {
      setFormError(err.message || "An error occurred while creating prescription.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPrescriptions = prescriptions.filter(
    (p) =>
      p.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.medication?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Prescription Management</h1>
          <p className="text-slate-500 text-sm">
            Issue and review medical prescriptions for registered patients.
          </p>
        </div>
        <button
          onClick={() => {
            setFormError(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm w-fit"
        >
          <Plus size={16} /> Write Prescription
        </button>
      </div>

      {/* Search & Filter */}
      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by patient name or medication..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 bg-white"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3 shadow-sm">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-500">Retrieving prescription ledger...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 p-6 rounded-2xl flex items-start gap-4 text-red-700">
          <AlertCircle size={24} className="shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="font-semibold text-sm">{error}</p>
            <button
              onClick={fetchPrescriptions}
              className="text-xs bg-red-100 hover:bg-red-200 text-red-800 font-bold px-3 py-1.5 rounded-lg transition"
            >
              Retry
            </button>
          </div>
        </div>
      ) : filteredPrescriptions.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-4 shadow-sm">
          <Pill size={48} className="mx-auto text-slate-300" />
          <div>
            <h3 className="font-bold text-slate-800 text-lg">No Prescriptions Found</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
              {searchQuery ? "No results match your search criteria." : "You have not issued any prescriptions yet."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPrescriptions.map((rx) => (
            <div
              key={rx.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition space-y-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                    <Pill size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{rx.medication}</h3>
                    <p className="text-xs font-semibold text-slate-500 flex items-center gap-1 mt-0.5">
                      <User size={12} /> Patient: {rx.patient_name || "Unassigned"}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                  {rx.duration || "7 days"}
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p>
                  <span className="font-semibold text-slate-800">Dosage:</span> {rx.dosage}
                </p>
                <p>
                  <span className="font-semibold text-slate-800">Instructions:</span> {rx.instructions}
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs text-slate-400 border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <Calendar size={12} /> Issued: {formatDate(rx.created_at)}
                </span>
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <CheckCircle2 size={12} /> Active Record
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-100">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText size={18} className="text-blue-600" /> New Prescription
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreatePrescription} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Patient <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formData.patient_id}
                  onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                >
                  <option value="" disabled>
                    -- Select patient --
                  </option>
                  {patients.length === 0 ? (
                    <option value="" disabled>
                      No patients available
                    </option>
                  ) : (
                    patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.email ? `(${p.email})` : ""}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Medication Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amoxicillin 500mg"
                  value={formData.medication}
                  onChange={(e) => setFormData({ ...formData, medication: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dosage <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1 capsule 3x daily"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Duration</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 7 days"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Instructions & Notes <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Take after meals. Finish full course."
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl font-semibold text-sm border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {submitting ? "Issuing..." : "Issue Prescription"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}