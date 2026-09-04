import type { Metadata } from "next";
import LandingPageClient from "./LandingPageClient";

export const metadata: Metadata = {
  title: "Swift MD | AI-Powered Telehealth & Clinical Support",
  description: "Next-generation virtual medical care connecting consultations with live patient vitals, medical research, health calculators, and clinical evidence.",
  openGraph: {
    title: "Swift MD | AI-Powered Telehealth & Clinical Support",
    description: "Next-generation virtual medical care connecting consultations with live patient vitals, medical research, health calculators, and clinical evidence.",
    url: "https://medicare-ai-two.vercel.app",
    siteName: "Swift MD",
    images: [
      {
        url: "https://medicare-ai-two.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Swift MD Telehealth Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function LandingPage() {
  return <LandingPageClient />;
}