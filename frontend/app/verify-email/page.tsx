"use client";
import Link from "next/link";
import { MailCheck } from "lucide-react";

export default function VerifyEmailNotice() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-12 px-10 shadow-2xl rounded-3xl border border-gray-100 text-center">
          <div className="inline-flex p-4 rounded-full bg-blue-50 text-blue-600 mb-6">
            <MailCheck size={48} />
          </div>
          
          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
            Check your email
          </h2>
          
          <p className="text-slate-600 mb-8 font-medium leading-relaxed">
            We’ve sent a verification link to your inbox. Please click the link to activate your account and access MedicareAI.
          </p>

          <div className="space-y-4">
            <Link 
              href="/login" 
              className="block w-full py-4 px-4 rounded-xl shadow-lg shadow-blue-200 text-sm font-black text-white bg-blue-600 hover:bg-blue-700 transition-all transform active:scale-[0.98]"
            >
              Back to Login
            </Link>
            
            <p className="text-xs text-slate-400">
              Didn't receive an email? Check your spam folder or contact support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}