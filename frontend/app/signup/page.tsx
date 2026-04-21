"use client";
import { useState } from "react";

export default function Signup() {
  const [role, setRole] = useState("patient");
  const [formData, setFormData] = useState({
    email: "", password: "", name: "", 
    specialization: "", license_number: "", city: ""
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, role }),
    });
    if (res.ok) window.location.href = "/login";
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-2xl shadow-xl">
      <h2 className="text-2xl font-bold mb-6">Create your Account</h2>
      
      <div className="flex gap-4 mb-6">
        <button 
          className={`flex-1 py-2 rounded-lg ${role === 'patient' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          onClick={() => setRole("patient")}
        >Patient</button>
        <button 
          className={`flex-1 py-2 rounded-lg ${role === 'doctor' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          onClick={() => setRole("doctor")}
        >Doctor</button>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        <input type="text" placeholder="Full Name" className="w-full p-3 border rounded-xl" required
          onChange={(e) => setFormData({...formData, name: e.target.value})} />
        
        <input type="email" placeholder="Email" className="w-full p-3 border rounded-xl" required
          onChange={(e) => setFormData({...formData, email: e.target.value})} />
        
        <input type="password" placeholder="Password" className="w-full p-3 border rounded-xl" required
          onChange={(e) => setFormData({...formData, password: e.target.value})} />

        {role === "doctor" && (
          <div className="space-y-4 pt-2 border-t">
            <p className="text-sm font-semibold text-gray-500">Professional Details</p>
            <input type="text" placeholder="Specialization" className="w-full p-3 border rounded-xl" required
              onChange={(e) => setFormData({...formData, specialization: e.target.value})} />
            <input type="text" placeholder="License Number" className="w-full p-3 border rounded-xl" required
              onChange={(e) => setFormData({...formData, license_number: e.target.value})} />
            <input type="text" placeholder="City" className="w-full p-3 border rounded-xl" required
              onChange={(e) => setFormData({...formData, city: e.target.value})} />
          </div>
        )}

        <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Sign Up</button>
      </form>
    </div>
  );
}