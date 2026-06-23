'use client';

import { Pill, Search } from "lucide-react";

export default function PharmacyPage() {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Pharmacy Store</h1>
        <p className="text-gray-600 mt-1">Order your prescription medicines and health essentials directly to your home.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 max-w-xl shadow-sm">
        <div className="flex gap-2 p-2 border border-gray-200 rounded-lg items-center bg-gray-50">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input 
            type="text" 
            placeholder="Search prescriptions, tablets, vitamins..." 
            className="w-full bg-transparent outline-none text-sm text-gray-700"
          />
        </div>
        
        <div className="mt-12 text-center text-gray-400 py-12">
          <Pill className="w-12 h-12 mx-auto text-gray-300 mb-2" />
          <p className="text-sm font-medium">Your prescriptions will appear here once verified by your clinician.</p>
        </div>
      </div>
    </div>
  );
}