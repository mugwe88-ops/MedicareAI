import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // This line is crucial to fix the "ancient" look

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
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}