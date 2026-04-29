import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar"; // 1. Import the Navbar

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Swift MD | Healthcare Reimagined",
  description: "Advanced healthcare platform for doctors and patients",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-gray-50 text-slate-900`}>
        <Navbar /> {/* 2. This brings the Logo/Buttons to the front page */}
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}