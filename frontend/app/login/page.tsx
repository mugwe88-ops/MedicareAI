"use client";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", data.token);
      // Redirect based on role returned from backend
      window.location.href = data.role === "doctor" ? "/dashboard/doctor" : "/doctors";
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-2xl shadow-xl">
      <h2 className="text-2xl font-bold mb-6">Welcome Back</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <input type="email" placeholder="Email" className="w-full p-3 border rounded-xl" required
          onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" className="w-full p-3 border rounded-xl" required
          onChange={(e) => setPassword(e.target.value)} />
        <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Login</button>
      </form>
    </div>
  );
}
