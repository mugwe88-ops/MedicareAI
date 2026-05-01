"use client";

import { MailCheck } from "lucide-react";
import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center">
        <div className="inline-flex p-4 rounded-full bg-blue-100 text-blue-600 mb-6">
          <MailCheck size={40} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Check your email</h1>
        <p className="text-slate-600 mb-8">
          We've sent a verification link to your email address. Please click the link to activate your account.
        </p>
        <Link 
          href="/login" 
          className="block w-full bg-[#237BFF] text-white py-3 rounded-lg font-bold hover:bg-blue-600 transition-colors"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
}