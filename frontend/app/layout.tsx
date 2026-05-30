"use client";

import { useEffect, useState } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import axios from "axios";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const BACKEND_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://medicareai-1.onrender.com';
        
        // Clean URL request string utilizing dynamic environment fallback
        const res = await axios.get(`${BACKEND_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setUser(res.data);
      } catch (err: any) {
        console.error("Session verification temporary failure:", err.message);
        
        // Only clear the token if the server specifically rejects the credentials (401/403)
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          console.warn("Session explicitly invalid. Clearing memory.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-slate-900`}>
        <Navbar user={user} />
        <main>
          {loading ? (
            <div className="flex h-screen items-center justify-center bg-white">
              <p className="text-blue-600 animate-pulse font-bold text-lg">Verifying MedicareAI Session...</p>
            </div>
          ) : (
            children
          )}
        </main>
      </body>
    </html>
  );
}