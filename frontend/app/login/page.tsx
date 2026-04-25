"use client";
import { useState } from "react";

export default function LoginPage() {
  // Always initialize with empty strings, never null/undefined
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Safety check: ensure name and value exist before updating state
    if (!name) return;

    setFormData((prev) => ({
      ...prev,
      [name]: value || "" 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevents the blank screen refresh
    setError("");
    setLoading(true);

    try {
      const res = await fetch("https://medicareai-1.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Handle successful login (e.g., save token, redirect)
      console.log("Login Success:", data);
      window.location.href = "/dashboard"; 

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        className="border p-2 mb-2 w-full text-black"
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        className="border p-2 mb-4 w-full text-black"
        required
      />
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <button 
        type="submit" 
        disabled={loading}
        className="bg-blue-600 text-white p-2 rounded w-full"
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}