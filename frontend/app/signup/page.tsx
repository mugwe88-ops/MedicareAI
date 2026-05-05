"use client";
import { useState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Patient", // Default to Patient
    specialization: "",
    license_number: "",
    city: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("https://medicareai-1.onrender.com/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed.");

      setIsSuccess(true);
      setTimeout(() => { window.location.href = "/verify-email-notice"; }, 2000);
    } catch (err: any) {
      setError(err.message === "Failed to fetch" ? "Server is waking up..." : err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-6">
        <div className="max-w-md w-full bg-white p-10 shadow-2xl rounded-3xl text-center">
          <div className="inline-flex p-4 rounded-full bg-blue-50 text-blue-600 mb-6">
            <MailCheck size={48} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">Check Your Email</h2>
          <p className="text-slate-600 mb-8 font-medium">
            Verification link sent to <span className="text-blue-600 font-bold">{formData.email}</span>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h1 className="text-4xl font-black text-blue-600 tracking-tight">Swift MD</h1>
        <p className="mt-2 text-slate-600 font-semibold">Create your account</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-10 shadow-2xl rounded-3xl border border-gray-100">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
              <input name="name" type="text" placeholder="John Doe" required onChange={handleChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
              <input name="email" type="email" placeholder="email@example.com" required onChange={handleChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Join as</label>
              <select name="role" value={formData.role} onChange={handleChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500">
                <option value="Patient">Patient</option>
                <option value="Doctor">Doctor</option>
              </select>
            </div>

            {/* Conditional Doctor Fields */}
            {formData.role === "Doctor" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Specialization</label>
                  <select name="specialization" required onChange={handleChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select Specialty</option>
                    <option value="dermatology">Dermatology</option>
                    <option value="cardiology">Cardiology</option>
                    <option value="pediatrics">Pediatrics</option>
                    <option value="general">General Consultation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">License Number (KMLTTB/KMPDC)</label>
                  <input name="license_number" type="text" placeholder="A-12345" required onChange={handleChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">City</label>
                  <input name="city" type="text" placeholder="Nairobi" required onChange={handleChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
              <input name="password" type="password" placeholder="••••••••" required onChange={handleChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            {error && <div className="text-rose-600 text-xs font-bold text-center">{error}</div>}

            <button type="submit" disabled={loading} className="w-full py-4 px-4 rounded-xl shadow-lg text-sm font-black text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300">
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}