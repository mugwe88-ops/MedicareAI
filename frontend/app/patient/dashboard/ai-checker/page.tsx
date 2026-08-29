"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, Send, Stethoscope, Sparkles } from "lucide-react";

export default function AiSymptomCheckerPage() {
  const router = useRouter();
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [assessment, setAssessment] = useState<{
    triage: string;
    department: string;
    recommendations: string[];
    urgency: "low" | "medium" | "high";
  } | null>(null);

  const commonQuickSymptoms = [
    "Persistent dry cough & fever",
    "Sharp chest discomfort & shortness of breath",
    "Severe throbbing headache & dizziness",
    "Lower abdominal pain & nausea",
    "Joint stiffness & swelling",
  ];

  const handleAnalyze = (textToAnalyze: string) => {
    if (!textToAnalyze.trim()) return;
    setLoading(true);
    setAssessment(null);

    // Simulate AI medical analysis model response
    setTimeout(() => {
      const lower = textToAnalyze.toLowerCase();
      let department = "General Practitioner";
      let urgency: "low" | "medium" | "high" = "low";
      let triage = "Symptoms appear mild. Rest and hydration are advised, but consult a physician if condition persists.";
      let recommendations = [
        "Monitor temperature every 6 hours",
        "Maintain proper oral hydration",
        "Avoid strenuous physical activities"
      ];

      if (lower.includes("chest") || lower.includes("breath") || lower.includes("severe")) {
        urgency = "high";
        department = "Cardiology / Emergency";
        triage = "High Priority: Symptoms suggest potential acute cardiac or respiratory distress. Seek immediate medical evaluation.";
        recommendations = [
          "Do not engage in physical exertion",
          "Book an emergency telehealth consultation immediately",
          "Call emergency services if pain intensifies"
        ];
      } else if (lower.includes("headache") || lower.includes("dizziness")) {
        urgency = "medium";
        department = "Neurology / General Medicine";
        triage = "Moderate Priority: Could be related to stress, blood pressure fluctuation, or migraine. Professional assessment recommended.";
        recommendations = [
          "Rest in a quiet, dark room",
          "Check blood pressure levels if monitor is available",
          "Schedule a doctor consultation within 24 hours"
        ];
      } else if (lower.includes("cough") || lower.includes("fever")) {
        urgency = "medium";
        department = "Pulmonology / General Practice";
        triage = "Moderate Priority: Possible viral infection or respiratory inflammation.";
        recommendations = [
          "Take antipyretics for fever control",
          "Isolate to prevent transmission",
          "Book a video consultation with a General Practitioner"
        ];
      }

      setAssessment({ triage, department, recommendations, urgency });
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="p-4 sm:p-8 bg-slate-950 min-h-screen text-slate-100 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Bot className="text-blue-500" size={32} />
              AI Symptom Checker
            </h1>
            <p className="text-slate-400 text-sm font-semibold mt-1">
              Describe your symptoms to receive instant clinical triage and department recommendations
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} /> AI Clinical Model v2.4
          </span>
        </div>

        {/* Input Card */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 shadow-sm mb-8">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
            What symptoms are you experiencing today?
          </label>
          <textarea
            rows={4}
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="E.g., I have had a mild fever, persistent dry cough, and fatigue for the past 2 days..."
            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-100 font-medium text-sm mb-4 resize-none"
          />

          <div className="mb-6">
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Or choose a common scenario:</p>
            <div className="flex flex-wrap gap-2">
              {commonQuickSymptoms.map((sample) => (
                <button
                  type="button"
                  key={sample}
                  onClick={() => {
                    setSymptoms(sample);
                    handleAnalyze(sample);
                  }}
                  className="px-3.5 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-bold transition"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => handleAnalyze(symptoms)}
            disabled={loading || !symptoms.trim()}
            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send size={16} />
            {loading ? "Analyzing Clinical Data..." : "Run AI Symptom Analysis"}
          </button>
        </div>

        {/* Results Output */}
        {assessment && (
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 shadow-sm animate-fadeIn space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <Stethoscope size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">Analysis Results</h2>
                  <p className="text-xs text-slate-400 font-medium">Recommended Department: <span className="text-blue-400 font-bold">{assessment.department}</span></p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                assessment.urgency === "high" ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" :
                assessment.urgency === "medium" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              }`}>
                {assessment.urgency} Urgency
              </span>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
              <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Clinical Triage Summary</p>
              <p className="text-sm font-medium text-slate-200 leading-relaxed">{assessment.triage}</p>
            </div>

            <div>
              <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">Recommended Actions</p>
              <ul className="space-y-2">
                {assessment.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-center gap-3 text-sm text-slate-300 font-medium bg-slate-950/50 px-4 py-3 rounded-xl border border-slate-800/60">
                    <span className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-bold">{index + 1}</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() =>
                  router.push(
                    `/patient/dashboard/appointments?department=${encodeURIComponent(
                      assessment.department
                    )}`
                  )
                }
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-md shadow-blue-600/20"
              >
                Schedule Consultation Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
