"use client";
import { useState } from "react";
import Link from "next/link";

// CRITICAL: Must be "export default" so Next.js can find the page
export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Using your Render backend URL from the screenshots
      const res = await fetch("https://medicareai-1.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid email or password");
      }

      // Save token for the session
      localStorage.setItem("token", data.token);

      // REDIRECT LOGIC: Redirect based on user role
      if (data.user.role === "doctor") {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/patient-portal";
      }

    } catch (err: any) {
      // Handle the "Failed to fetch" error seen in your screenshot
      setError(err.message === "Failed to fetch" 
        ? "Server is waking up. Please wait 30 seconds and try again." 
        : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h1 className="text-4xl font-black text-blue-600 tracking-tight">Swift MD</h1>
        <p className="mt-2 text-slate-600 font-semibold">Sign in to your portal</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-10 shadow-2xl rounded-3xl border border-gray-100">
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <input
                name="email"
                type="email"
                placeholder="Email Address"
                required
                onChange={handleChange}
                className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 bg-white transition-all"
              />
            </div>

            <div>
              <input
                name="password"
                type="password"
                placeholder="Password"
                required
                onChange={handleChange}
                className="w-full px-4 py-3.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 bg-white transition-all"
              />
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold px-4 py-3 rounded-xl text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 rounded-xl shadow-lg shadow-blue-200 text-sm font-black text-white bg-blue-600 hover:bg-blue-700 transition-all transform active:scale-[0.98] disabled:bg-blue-300"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link href="/signup" className="text-sm font-bold text-blue-600 hover:text-blue-800 transition">
              Don't have an account? Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}