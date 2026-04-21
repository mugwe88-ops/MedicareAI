"use client";
import { useState } from "react";

export default function AddDoctorForm() {
  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    city: "",
    consultation_fee: "",
    license_number: "",
    bio: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    try {
      const res = await fetch(`${API_BASE}/api/doctors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Doctor added successfully!");
        setFormData({ name: "", specialization: "", city: "", consultation_fee: "", license_number: "", bio: "" });
      }
    } catch (error) {
      console.error("Error adding doctor:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white shadow-lg rounded-2xl mt-10">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Register New Specialist</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input 
            type="text" 
            className="w-full p-3 border rounded-xl" 
            placeholder="e.g. Dr. Jane Doe"
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required 
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input 
            type="text" 
            placeholder="Specialization (e.g. Cardiologist)" 
            className="p-3 border rounded-xl"
            onChange={(e) => setFormData({...formData, specialization: e.target.value})}
            required 
          />
          <input 
            type="text" 
            placeholder="License Number" 
            className="p-3 border rounded-xl"
            onChange={(e) => setFormData({...formData, license_number: e.target.value})}
            required 
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input 
            type="text" 
            placeholder="City" 
            className="p-3 border rounded-xl"
            onChange={(e) => setFormData({...formData, city: e.target.value})}
            required 
          />
          <input 
            type="number" 
            placeholder="Consultation Fee (KES)" 
            className="p-3 border rounded-xl"
            onChange={(e) => setFormData({...formData, consultation_fee: e.target.value})}
            required 
          />
        </div>
        <textarea 
          placeholder="Brief Bio" 
          className="w-full p-3 border rounded-xl h-32"
          onChange={(e) => setFormData({...formData, bio: e.target.value})}
        ></textarea>
        <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors">
          Add Doctor to Registry
        </button>
      </form>
    </div>
  );
}