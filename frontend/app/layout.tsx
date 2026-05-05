"use client";

import { useEffect, useState } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import axios from "axios";

const inter = Inter({ subsets: ["latin"] });

// Note: Metadata must be moved to a separate layout-metadata.ts 
// or omitted if using "use client" at the top level of layout.tsx.

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
        // Point to your running server.js port
        const res = await axios.get("[https://medicareai-1.onrender.com](https://medicareai-1.onrender.com)/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error("Session expired or invalid");
        localStorage.removeItem("token");
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
            <div className="flex h-screen items-center justify-center">
              <p className="text-blue-600 animate-pulse font-bold">Verifying MedicareAI Session...</p>
            </div>
          ) : (
            children
          )}
        </main>
      </body>
    </html>
  );
}