"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, ShieldCheck, ArrowLeft, Clock, User, FileText, AlertCircle } from "lucide-react";

export default function BookAppointmentPage() {
  const router = useRouter();

  // Form state
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [bodySystem, setBodySystem] = useState("General / Systemic");
  const [symptomSeverity, setSymptomSeverity] = useState("Moderate");
  const [symptomDuration, setSymptomDuration] = useState("1-3 days");
  const [painScale, setPainScale] = useState(3);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [reasonForVisit, setReasonForVisit] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const commonSymptoms = [
    "Fever",
    "Fatigue / Weakness",
    "Shortness of Breath",
    "Dizziness",
    "Nausea",
    "Acute Pain",
  ];

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor) {
      setErrorMessage("Please select a doctor to proceed.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
      const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "https://medicareai-1.onrender.com";

      const response = await fetch(`${API_BASE}/api/patient/appointments/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          doctor: selectedDoctor,
          bodySystem,
          symptomSeverity,
          symptomDuration,
          painScale,
          symptoms: selectedSymptoms,
          reasonForVisit,
        }),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setTimeout(() => {
          router.push("/patient/dashboard");
        }, 1500);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setErrorMessage(errorData.message || "Failed to schedule appointment. Please try again.");
      }
    } catch (err) {
      console.error("Booking error:", err);
      setErrorMessage("Network error. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 overflow-x-hidden bg-slate-50 w-full max-w-full">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <button
            onClick={() => router.back()}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 mb-2 cursor-pointer transition-colors"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Book Appointment
          </h1>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
            Secure Clinical Entry
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-3.5 py-2 rounded-xl text-xs font-bold self-start sm:self-auto">
          <ShieldCheck size={16} className="text-emerald-600" />
          <span>Encrypted Gateway</span>
        </div>
      </div>

      {/* Main Form Container - Light Theme */}
      <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm max-w-4xl">
        {submitSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
            ✓ Appointment successfully scheduled! Redirecting to dashboard...
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold flex items-center gap-2">
            <AlertCircle size={16} /> {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SELECT DOCTOR */}
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider">
              Select Doctor
            </label>
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
            >
              <option value="">-- Select Doctor --</option>
              <option value="Dr. Sarah Jenkins">Dr. Sarah Jenkins (Cardiology)</option>
              <option value="Dr. Marcus Vance">Dr. Marcus Vance (General Medicine)</option>
              <option value="Dr. Elena Rostova">Dr. Elena Rostova (Neurology)</option>
              <option value="Dr. Arthur Pendelton">Dr. Arthur Pendelton (Orthopedics)</option>
            </select>
          </div>

          {/* 3 COLUMN INPUTS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* BODY SYSTEM */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider">
                Body System
              </label>
              <select
                value={bodySystem}
                onChange={(e) => setBodySystem(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
              >
                <option value="General / Systemic">General / Systemic</option>
                <option value="Cardiovascular">Cardiovascular</option>
                <option value="Respiratory">Respiratory</option>
                <option value="Gastrointestinal">Gastrointestinal</option>
                <option value="Musculoskeletal">Musculoskeletal</option>
                <option value="Neurological">Neurological</option>
              </select>
            </div>

            {/* SYMPTOM SEVERITY */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider">
                Symptom Severity
              </label>
              <select
                value={symptomSeverity}
                onChange={(e) => setSymptomSeverity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
              >
                <option value="Mild">Mild</option>
                <option value="Moderate">Moderate</option>
                <option value="Severe">Severe</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            {/* SYMPTOM DURATION */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider">
                Symptom Duration
              </label>
              <select
                value={symptomDuration}
                onChange={(e) => setSymptomDuration(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
              >
                <option value="Less than 24 hours">Less than 24 hours</option>
                <option value="1-3 days">1-3 days</option>
                <option value="4-7 days">4-7 days</option>
                <option value="More than 1 week">More than 1 week</option>
              </select>
            </div>
          </div>

          {/* COMMON ASSOCIATED SYMPTOMS */}
          <div className="space-y-3">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider">
              Common Associated Symptoms (Select all that apply)
            </label>
            <div className="flex flex-wrap gap-2">
              {commonSymptoms.map((symptom) => {
                const isSelected = selectedSymptoms.includes(symptom);
                return (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => handleSymptomToggle(symptom)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/80"
                    }`}
                  >
                    + {symptom}
                  </button>
                );
              })}
            </div>
          </div>

          {/* PAIN SCALE */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
                Pain Scale (0 = None, 10 = Unbearable)
              </label>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-3 py-1 rounded-full text-xs font-black">
                Level: {painScale} / 10
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={painScale}
              onChange={(e) => setPainScale(Number(e.target.value))}
              className="w-full accent-blue-600 bg-slate-200 rounded-lg h-2 cursor-pointer"
            />
          </div>

          {/* REASON FOR VISIT */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider">
              Reason for Visit / Detailed Symptoms
            </label>
            <textarea
              rows={4}
              value={reasonForVisit}
              onChange={(e) => setReasonForVisit(e.target.value)}
              placeholder="Describe your symptoms in detail..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition resize-none"
            />
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Submitting Request..." : "Confirm & Book Appointment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}