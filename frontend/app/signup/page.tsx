"use client";
import { useState } from "react";
import Link from "next/link";
import { MailCheck, AlertCircle } from "lucide-react";

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "Patient",
    specialization: "",
    license_number: "",
    city: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Updated endpoint from /signup to /register to match backend routes
      const res = await fetch("https://medicareai-1.onrender.com/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Registration failed.");
      }

      setIsSuccess(true);
      setTimeout(() => {
        window.location.href = "/verify-email-notice";
      }, 2000);
    } catch (err: any) {
      setError(err.message === "Failed to fetch" ? "Server is starting up, please try again..." : err.message);
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
          
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-700 text-sm font-semibold animate-in fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
              <input 
                name="name" 
                type="text" 
                value={formData.name}
                placeholder="John Doe" 
                required 
                onChange={handleChange} 
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
              <input 
                name="email" 
                type="email" 
                value={formData.email}
                placeholder="email@example.com" 
                required 
                onChange={handleChange} 
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Phone Number</label>
              <input 
                name="phone" 
                type="tel" 
                value={formData.phone}
                placeholder="+254 700 000000" 
                required 
                onChange={handleChange} 
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Join as</label>
              <select 
                name="role" 
                value={formData.role} 
                onChange={handleChange} 
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Patient">Patient</option>
                <option value="Doctor">Doctor</option>
              </select>
            </div>

            {/* Conditional Doctor Fields */}
            {formData.role === "Doctor" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Specialization</label>
                  <select 
                    name="specialization" 
                    value={formData.specialization}
                    required 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Specialty</option>
                    <option value="dermatology">Dermatology</option>
                    <option value="cardiology">Cardiology</option>
                    <option value="pediatrics">Pediatrics</option>
                    <option value="general">General Consultation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">License Number (KMLTTB/KMPDC)</label>
                  <input 
                    name="license_number" 
                    type="text" 
                    value={formData.license_number}
                    placeholder="A-12345" 
                    required 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">City</label>
                  <input 
                    name="city" 
                    type="text" 
                    value={formData.city}
                    placeholder="Nairobi" 
                    required 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
              <input 
                name="password" 
                type="password" 
                value={formData.password}
                placeholder="••••••••" 
                required 
                onChange={handleChange} 
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full py-4 px-4 rounded-xl shadow-lg text-sm font-black text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm font-semibold text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}