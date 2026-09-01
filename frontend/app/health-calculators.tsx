"use client";

import { useState } from "react";
import { HeartPulse, Droplets, Scale } from "lucide-react";

export function HealthCalculators() {
  const [activeTab, setActiveTab] = useState<"bmi" | "ldl" | "water">("bmi");

  // BMI State
  const [weight, setWeight] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [bmiResult, setBmiResult] = useState<{ score: string; status: string } | null>(null);

  // LDL State (Friedewald Formula: LDL = Total - HDL - (Triglycerides / 5))
  const [totalChol, setTotalChol] = useState<string>("");
  const [hdl, setHdl] = useState<string>("");
  const [triglycerides, setTriglycerides] = useState<string>("");
  const [ldlResult, setLdlResult] = useState<{ score: string; status: string } | null>(null);

  // Hydration State
  const [waterWeight, setWaterWeight] = useState<string>("");
  const [waterResult, setWaterResult] = useState<string | null>(null);

  // Handlers
  const calculateBMI = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100; // cm to m
    if (w > 0 && h > 0) {
      const score = (w / (h * h)).toFixed(1);
      const val = parseFloat(score);
      let status = "Normal weight";
      if (val < 18.5) status = "Underweight";
      else if (val >= 25 && val < 29.9) status = "Overweight";
      else if (val >= 30) status = "Obese";
      setBmiResult({ score, status });
    }
  };

  const calculateLDL = (e: React.FormEvent) => {
    e.preventDefault();
    const tc = parseFloat(totalChol);
    const h = parseFloat(hdl);
    const tg = parseFloat(triglycerides);
    if (tc > 0 && h > 0 && tg > 0) {
      const score = (tc - h - tg / 5).toFixed(1);
      const val = parseFloat(score);
      let status = "Optimal (<100 mg/dL)";
      if (val >= 100 && val <= 129) status = "Near Optimal";
      else if (val >= 130 && val <= 159) status = "Borderline High";
      else if (val >= 160 && val <= 189) status = "High";
      else if (val >= 190) status = "Very High";
      setLdlResult({ score, status });
    }
  };

  const calculateWater = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(waterWeight);
    if (w > 0) {
      const liters = ((w * 35) / 1000).toFixed(1);
      setWaterResult(liters);
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">Interactive Health Calculators</h2>
          <p className="text-xs sm:text-sm text-slate-500">Calculate instant health metrics with validated clinical formulas</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setActiveTab("bmi")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "bmi" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Scale className="w-3.5 h-3.5" /> BMI
          </button>
          <button
            onClick={() => setActiveTab("ldl")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "ldl" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5" /> LDL Cholesterol
          </button>
          <button
            onClick={() => setActiveTab("water")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "water" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Droplets className="w-3.5 h-3.5" /> Hydration
          </button>
        </div>
      </div>

      {/* CALCULATOR 1: BMI */}
      {activeTab === "bmi" && (
        <form onSubmit={calculateBMI} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Weight (kg)</label>
            <input
              type="number"
              placeholder="e.g. 70"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-blue-500 bg-slate-50"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Height (cm)</label>
            <input
              type="number"
              placeholder="e.g. 175"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-blue-500 bg-slate-50"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-sm"
          >
            Calculate BMI
          </button>

          {bmiResult && (
            <div className="md:col-span-3 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-between text-xs mt-2">
              <span className="font-medium text-slate-700">Calculated BMI Score:</span>
              <div className="text-right">
                <span className="font-black text-blue-700 text-base">{bmiResult.score} kg/m²</span>
                <span className="ml-2 font-bold text-slate-600">({bmiResult.status})</span>
              </div>
            </div>
          )}
        </form>
      )}

      {/* CALCULATOR 2: LDL CHOLESTEROL */}
      {activeTab === "ldl" && (
        <form onSubmit={calculateLDL} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Total Cholesterol (mg/dL)</label>
            <input
              type="number"
              placeholder="e.g. 200"
              value={totalChol}
              onChange={(e) => setTotalChol(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-blue-500 bg-slate-50"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">HDL Cholesterol (mg/dL)</label>
            <input
              type="number"
              placeholder="e.g. 50"
              value={hdl}
              onChange={(e) => setHdl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-blue-500 bg-slate-50"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Triglycerides (mg/dL)</label>
            <input
              type="number"
              placeholder="e.g. 150"
              value={triglycerides}
              onChange={(e) => setTriglycerides(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-blue-500 bg-slate-50"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-sm"
          >
            Calculate LDL
          </button>

          {ldlResult && (
            <div className="md:col-span-4 p-4 bg-purple-50 rounded-2xl border border-purple-100 flex items-center justify-between text-xs mt-2">
              <span className="font-medium text-slate-700">Estimated LDL Level (Friedewald):</span>
              <div className="text-right">
                <span className="font-black text-purple-700 text-base">{ldlResult.score} mg/dL</span>
                <span className="ml-2 font-bold text-slate-600">({ldlResult.status})</span>
              </div>
            </div>
          )}
        </form>
      )}

      {/* CALCULATOR 3: HYDRATION */}
      {activeTab === "water" && (
        <form onSubmit={calculateWater} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">Body Weight (kg)</label>
            <input
              type="number"
              placeholder="e.g. 68"
              value={waterWeight}
              onChange={(e) => setWaterWeight(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-blue-500 bg-slate-50"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-sm"
          >
            Calculate Target
          </button>

          {waterResult && (
            <div className="md:col-span-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between text-xs mt-2">
              <span className="font-medium text-slate-700">Recommended Daily Intake:</span>
              <span className="font-black text-emerald-700 text-base">{waterResult} Liters / day</span>
            </div>
          )}
        </form>
      )}
    </div>
  );
}