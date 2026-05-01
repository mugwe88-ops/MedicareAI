"use client";
import { useState } from "react";
import { Beaker, User, Activity, AlertCircle, Save } from "lucide-react";

export default function LabResultForm({ patientId, testId }: { patientId: string; testId: string }) {
  const [formData, setFormData] = useState({
    parameter_name: "",
    result_value: "",
    unit: "",
    reference_range: "",
    is_abnormal: false,
    lab_notes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lab-results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, patient_id: patientId, test_id: testId }),
      });

      if (response.ok) {
        alert("Result uploaded successfully!");
        setFormData({ parameter_name: "", result_value: "", unit: "", reference_range: "", is_abnormal: false, lab_notes: "" });
      }
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  return (
    <div className="max-w-2xl bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="bg-blue-600 p-6 flex items-center space-x-3">
        <Beaker className="text-white" size={24} />
        <h2 className="text-white font-black tracking-tight uppercase text-sm">Input Lab Findings</h2>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Parameter Name */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Parameter</label>
            <input
              type="text"
              placeholder="e.g. Hemoglobin"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-700"
              value={formData.parameter_name}
              onChange={(e) => setFormData({...formData, parameter_name: e.target.value})}
              required
            />
          </div>

          {/* Result Value */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Result Value</label>
            <input
              type="text"
              placeholder="e.g. 14.2"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-700"
              value={formData.result_value}
              onChange={(e) => setFormData({...formData, result_value: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Units */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Units</label>
            <input
              type="text"
              placeholder="e.g. g/dL"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-700"
              value={formData.unit}
              onChange={(e) => setFormData({...formData, unit: e.target.value})}
            />
          </div>

          {/* Reference Range */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Ref. Range</label>
            <input
              type="text"
              placeholder="e.g. 13.0 - 17.0"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-700"
              value={formData.reference_range}
              onChange={(e) => setFormData({...formData, reference_range: e.target.value})}
            />
          </div>
        </div>

        {/* Flag Abnormal */}
        <div className="flex items-center justify-between p-4 bg-orange-50 rounded-2xl border border-orange-100">
          <div className="flex items-center space-x-3">
            <AlertCircle className="text-orange-500" size={20} />
            <span className="text-sm font-black text-orange-700 uppercase tracking-tight">Flag as Abnormal?</span>
          </div>
          <input
            type="checkbox"
            className="w-6 h-6 rounded-lg accent-orange-500"
            checked={formData.is_abnormal}
            onChange={(e) => setFormData({...formData, is_abnormal: e.target.checked})}
          />
        </div>

        {/* Lab Notes */}
        <div className="space-y-2">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Lab Tech Notes</label>
          <textarea
            rows={3}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-700 resize-none"
            value={formData.lab_notes}
            onChange={(e) => setFormData({...formData, lab_notes: e.target.value})}
          />
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center space-x-2"
        >
          <Save size={18} />
          <span className="uppercase tracking-widest text-sm">Save & Report Result</span>
        </button>
      </form>
    </div>
  );
}