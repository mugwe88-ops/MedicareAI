"use client";
import React, { useState } from "react";
import { Beaker, AlertCircle, Save, ArrowLeft, Eye, CheckCircle } from "lucide-react";

export default function LabResultForm({ patientId, testId }: { patientId: string; testId: string }) {
  const [isPreview, setIsPreview] = useState(false);
  const [formData, setFormData] = useState({
    parameter_name: "",
    result_value: "",
    unit: "",
    reference_range: "",
    is_abnormal: false,
    lab_notes: ""
  });

  const handleFinalSubmit = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lab/results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, patient_id: patientId, test_id: testId }),
      });

      if (response.ok) {
        alert("Clinical record updated successfully.");
        setIsPreview(false);
        setFormData({ parameter_name: "", result_value: "", unit: "", reference_range: "", is_abnormal: false, lab_notes: "" });
      }
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  if (isPreview) {
    return (
      <div className="max-w-2xl bg-white rounded-3xl shadow-2xl border-4 border-blue-500 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-blue-500 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-white">
            <Eye size={20} />
            <span className="font-black uppercase tracking-widest text-xs">Verification Mode</span>
          </div>
          <span className="bg-white text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">Review Required</span>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Parameter</p>
              <p className="font-bold text-lg text-slate-800">{formData.parameter_name}</p>
            </div>
            <div className={`p-4 rounded-2xl ${formData.is_abnormal ? 'bg-red-50 border border-red-100' : 'bg-slate-50'}`}>
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Result</p>
              <p className={`font-black text-lg ${formData.is_abnormal ? 'text-red-600' : 'text-slate-800'}`}>
                {formData.result_value} <span className="text-sm font-medium">{formData.unit}</span>
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Reference Range</p>
            <p className="font-bold text-slate-700">{formData.reference_range || "N/A"}</p>
          </div>

          {formData.lab_notes && (
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
              <p className="text-[10px] font-black text-amber-600 uppercase mb-1">Technician Notes</p>
              <p className="text-sm text-amber-900 leading-relaxed italic">"{formData.lab_notes}"</p>
            </div>
          )}

          <div className="flex space-x-4 pt-4">
            <button 
              onClick={() => setIsPreview(false)}
              className="flex-1 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center space-x-2"
            >
              <ArrowLeft size={18} />
              <span className="uppercase tracking-widest text-xs">Edit</span>
            </button>
            <button 
              onClick={handleFinalSubmit}
              className="flex-[2] py-4 bg-green-600 text-white font-black rounded-2xl shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all flex items-center justify-center space-x-2"
            >
              <CheckCircle size={18} />
              <span className="uppercase tracking-widest text-xs">Confirm & Release</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="bg-slate-900 p-6 flex items-center space-x-3">
        <Beaker className="text-blue-400" size={24} />
        <h2 className="text-white font-black tracking-tight uppercase text-sm">Lab Result Entry</h2>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); setIsPreview(true); }} className="p-8 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <input
            type="text"
            placeholder="Parameter"
            className="w-full px-4 py-3 bg-slate-50 border rounded-xl font-bold"
            value={formData.parameter_name}
            onChange={(e) => setFormData({...formData, parameter_name: e.target.value})}
            required
          />
          <input
            type="text"
            placeholder="Value"
            className="w-full px-4 py-3 bg-slate-50 border rounded-xl font-bold"
            value={formData.result_value}
            onChange={(e) => setFormData({...formData, result_value: e.target.value})}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <input
            type="text"
            placeholder="Units (g/dL)"
            className="w-full px-4 py-3 bg-slate-50 border rounded-xl font-bold"
            value={formData.unit}
            onChange={(e) => setFormData({...formData, unit: e.target.value})}
          />
          <input
            type="text"
            placeholder="Ref Range"
            className="w-full px-4 py-3 bg-slate-50 border rounded-xl font-bold"
            value={formData.reference_range}
            onChange={(e) => setFormData({...formData, reference_range: e.target.value})}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-red-50 rounded-2xl border border-red-100">
          <div className="flex items-center space-x-3">
            <AlertCircle className="text-red-500" size={20} />
            <span className="text-xs font-black text-red-700 uppercase tracking-widest">Flag Abnormal Value</span>
          </div>
          <input
            type="checkbox"
            className="w-6 h-6 rounded-lg accent-red-600"
            checked={formData.is_abnormal}
            onChange={(e) => setFormData({...formData, is_abnormal: e.target.checked})}
          />
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all flex items-center justify-center space-x-2"
        >
          <Eye size={18} />
          <span className="uppercase tracking-widest text-xs">Preview Findings</span>
        </button>
      </form>
    </div>
  );
}