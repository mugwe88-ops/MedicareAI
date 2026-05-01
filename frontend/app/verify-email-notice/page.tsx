"use client";
import Link from "next/link";

export default function VerifyEmailNotice() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-10 shadow-2xl rounded-3xl text-center">
        <h2 className="text-3xl font-black text-slate-900 mb-4">Check Your Email</h2>
        <p className="text-slate-600 mb-8">
          We've sent a verification link to your email address. Please click it to activate your account.
        </p>
        <Link href="/login" className="text-blue-600 font-bold hover:underline">
          Back to Login
        </Link>
      </div>
    </div>
  );
}