"use client";

import { useState } from "react";
import { Scale, HeartPulse, Droplets } from "lucide-react";

export default function HealthCalculators() {
  const [activeTab, setActiveTab] = useState<"bmi" | "ldl" | "water">("bmi");

  // Units Preference
  const [cholUnit, setCholUnit] = useState<"mgdl" | "mmoll">("mgdl");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [heightUnit, setHeightUnit] = useState<"cm" | "in">("cm");

  // BMI State
  const [weight, setWeight] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [bmiResult, setBmiResult] = useState<{ score: string; status: string } | null>(null);

  // LDL State
  const [totalChol, setTotalChol] = useState<string>("");
  const [hdl, setHdl] = useState<string>("");
  const [triglycerides, setTriglycerides] = useState<string>("");
  const [ldlResult, setLdlResult] = useState<{ score: string; status: string; unit: string } | null>(null);

  // Hydration State
  const [waterWeight, setWaterWeight] = useState<string>("");
  const [waterResult, setWaterResult] = useState<{ liters: string; oz: string } | null>(null);

  const calculateBMI = (e: React.FormEvent) => {
    e.preventDefault();
    let w = parseFloat(weight);
    let h = parseFloat(height);

    if (w > 0 && h > 0) {
      // Convert lbs to kg if needed
      if (weightUnit === "lbs") w = w * 0.453592;
      // Convert inches to meters or cm to meters
      const hMeters = heightUnit === "in" ? h * 0.0254 : h / 100;

      const score = (w / (hMeters * hMeters)).toFixed(1);
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
      let scoreNum = 0;

      if (cholUnit === "mgdl") {
        // Friedewald Formula in mg/dL: LDL = TC - HDL - (TG / 5)
        scoreNum = tc - h - tg / 5;
      } else {
        // Friedewald Formula in mmol/L: LDL = TC - HDL - (TG / 2.2)
        scoreNum = tc - h - tg / 2.2;
      }

      const score = scoreNum.toFixed(2);
      const valMgDl = cholUnit === "mgdl" ? scoreNum : scoreNum * 38.67; // Convert to mg/dL for threshold evaluation

      let status = "Optimal (<100 mg/dL)";
      if (valMgDl >= 100 && valMgDl <= 129) status = "Near Optimal";
      else if (valMgDl >= 130 && valMgDl <= 159) status = "Borderline High";
      else if (valMgDl >= 160 && valMgDl <= 189) status = "High";
      else if (valMgDl >= 190) status = "Very High";

      setLdlResult({
        score,
        status,
        unit: cholUnit === "mgdl" ? "mg/dL" : "mmol/L",
      });
    }
  };

  const calculateWater = (e: React.FormEvent) => {
    e.preventDefault();
    let w = parseFloat(waterWeight);
    if (w > 0) {
      const kg = weightUnit === "lbs" ? w * 0.453592 : w;
      const liters = ((kg * 35) / 1000).toFixed(1);
      const oz = (parseFloat(liters) * 33.814).toFixed(0);
      setWaterResult({ liters, oz });
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">Interactive Health Calculators</h2>
          <p className="text-xs sm:text-sm text-slate-500">Calculate instant health metrics with customizable measurement units</p>
        </div>

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

      {/* BMI Calculator */}
      {activeTab === "bmi" && (
        <form onSubmit={calculateBMI} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700">Weight</label>
                <button
                  type="button"
                  onClick={() => setWeightUnit(weightUnit === "kg" ? "lbs" : "kg")}
                  className="text-[10px] font-bold text-blue-600 hover:underline uppercase"
                >
                  Unit: {weightUnit}
                </button>
              </div>
              <input
                type="number"
                step="any"
                placeholder={weightUnit === "kg" ? "e.g. 70" : "e.g. 154"}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-blue-500 bg-slate-50"
                required
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700">Height</label>
                <button
                  type="button"
                  onClick={() => setHeightUnit(heightUnit === "cm" ? "in" : "cm")}
                  className="text-[10px] font-bold text-blue-600 hover:underline uppercase"
                >
                  Unit: {heightUnit}
                </button>
              </div>
              <input
                type="number"
                step="any"
                placeholder={heightUnit === "cm" ? "e.g. 175" : "e.g. 69"}
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
          </div>

          {bmiResult && (
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700">Calculated BMI Score:</span>
              <div className="text-right">
                <span className="font-black text-blue-700 text-base">{bmiResult.score} kg/m²</span>
                <span className="ml-2 font-bold text-slate-600">({bmiResult.status})</span>
              </div>
            </div>
          )}
        </form>
      )}

      {/* LDL Calculator */}
      {activeTab === "ldl" && (
        <form onSubmit={calculateLDL} className="space-y-4">
          <div className="flex justify-end items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Unit System:</span>
            <div className="bg-slate-100 p-0.5 rounded-lg flex text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setCholUnit("mgdl")}
                className={`px-2.5 py-1 rounded-md transition ${
                  cholUnit === "mgdl" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
                }`}
              >
                mg/dL
              </button>
              <button
                type="button"
                onClick={() => setCholUnit("mmoll")}
                className={`px-2.5 py-1 rounded-md transition ${
                  cholUnit === "mmoll" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
                }`}
              >
                mmol/L
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Total Cholesterol ({cholUnit === "mgdl" ? "mg/dL" : "mmol/L"})
              </label>
              <input
                type="number"
                step="any"
                placeholder={cholUnit === "mgdl" ? "e.g. 200" : "e.g. 5.18"}
                value={totalChol}
                onChange={(e) => setTotalChol(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-blue-500 bg-slate-50"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                HDL Cholesterol ({cholUnit === "mgdl" ? "mg/dL" : "mmol/L"})
              </label>
              <input
                type="number"
                step="any"
                placeholder={cholUnit === "mgdl" ? "e.g. 50" : "e.g. 1.29"}
                value={hdl}
                onChange={(e) => setHdl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-blue-500 bg-slate-50"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Triglycerides ({cholUnit === "mgdl" ? "mg/dL" : "mmol/L"})
              </label>
              <input
                type="number"
                step="any"
                placeholder={cholUnit === "mgdl" ? "e.g. 150" : "e.g. 1.70"}
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
          </div>

          {ldlResult && (
            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700">Estimated LDL Level (Friedewald):</span>
              <div className="text-right">
                <span className="font-black text-purple-700 text-base">
                  {ldlResult.score} {ldlResult.unit}
                </span>
                <span className="ml-2 font-bold text-slate-600">({ldlResult.status})</span>
              </div>
            </div>
          )}
        </form>
      )}

      {/* Hydration Calculator */}
      {activeTab === "water" && (
        <form onSubmit={calculateWater} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700">Body Weight</label>
                <button
                  type="button"
                  onClick={() => setWeightUnit(weightUnit === "kg" ? "lbs" : "kg")}
                  className="text-[10px] font-bold text-blue-600 hover:underline uppercase"
                >
                  Unit: {weightUnit}
                </button>
              </div>
              <input
                type="number"
                step="any"
                placeholder={weightUnit === "kg" ? "e.g. 68" : "e.g. 150"}
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
          </div>

          {waterResult && (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700">Recommended Daily Intake:</span>
              <span className="font-black text-emerald-700 text-base">
                {waterResult.liters} Liters ({waterResult.oz} fl oz) / day
              </span>
            </div>
          )}
        </form>
      )}
    </div>
  );
}