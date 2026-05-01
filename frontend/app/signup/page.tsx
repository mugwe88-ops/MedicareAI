"use client";
import { useState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react"; // Optional: for a nice success icon

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // New state for success UI
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Doctor"
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

      if (!res.ok) {
        throw new Error(data.message || "Registration failed. Check your connection.");
      }

      // Handle successful signup
      setIsSuccess(true);
      
      // Redirect to the instruction page after a brief delay 
      // or keep the user here to see the success message
      setTimeout(() => {
        window.location.href = "/verify-email-notice";
      }, 2000);

    } catch (err: any) {
      setError(err.message === "Failed to fetch" 
        ? "Server is waking up. Please wait 30 seconds." 
        : err.message);
    } finally {
      setLoading(false);
    }
  };

  // Success UI fragment
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-6">
        <div className="max-w-md w-full bg-white p-10 shadow-2xl rounded-3xl border border-gray-100 text-center">
          <div className="inline-flex p-4 rounded-full bg-blue-50 text-blue-600 mb-6">
            <MailCheck size={48} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">Check Your Email</h2>
          <p className="text-slate-600 mb-8 font-medium">
            We've sent a verification link to <span className="text-blue-600 font-bold">{formData.email}</span>. 
            Please verify your account to continue.
          </p>
          <div className="animate-pulse text-sm text-blue-500 font-bold">
            Redirecting to instructions...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h1 className="text-4xl font-black text-blue-600 tracking-tight">Swift MD</h1>
        <p className="mt-2 text-slate-600 font-semibold">Create your healthcare account</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-10 shadow-2xl rounded-3xl border border-gray-100">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
              <input
                name="name"
                type="text"
                placeholder="WILLIAM WERU"
                required
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 bg-gray-50 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
              <input
                name="email"
                type="email"
                placeholder="willyweyru6@gmail.com"
                required
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 bg-gray-50 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Join as</label>
              <select 
                name="role" 
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 bg-gray-50 transition-all"
              >
                <option value="Patient">Patient</option>
                <option value="Doctor">Doctor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                required
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 bg-gray-50 transition-all"
              />
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold px-4 py-3 rounded-xl text-center leading-tight">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 rounded-xl shadow-lg shadow-blue-200 text-sm font-black text-white bg-blue-600 hover:bg-blue-700 transition-all transform active:scale-[0.98] disabled:bg-blue-300"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-blue-600 hover:text-blue-800 transition">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}