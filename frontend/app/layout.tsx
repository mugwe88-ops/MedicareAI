import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://medicare-ai-two.vercel.app"),
  title: {
    default: "Swift MD | Telehealth & Remote Clinical Support Platform",
    template: "%s | Swift MD",
  },
  description:
    "Empowering healthcare providers and patients with AI-assisted clinical decision support, secure virtual consultations, and verified PubMed guidelines.",
  keywords: [
    "Swift MD",
    "Telehealth Platform",
    "Clinical Decision Support",
    "Virtual Doctor Consultation",
    "AI Healthcare",
    "Remote Patient Care",
    "PubMed Clinical Guidelines",
  ],
  authors: [{ name: "Swift MD Team" }],
  creator: "Swift MD",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Swift MD — Next-Gen Telehealth & Clinical Support",
    description:
      "Connect with doctors, manage patient health, and access verified biomedical research in real time.",
    url: "/",
    siteName: "Swift MD",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Swift MD Platform Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Swift MD | Telehealth & Clinical Support",
    description: "AI-powered clinical decision support & virtual consultation platform.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}