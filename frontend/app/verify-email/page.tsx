"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided.");
      return;
    }

    fetch(`https://medicareai-1.onrender.com/api/auth/verify?token=${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Verification failed");
        setStatus("success");
        setMessage("Email verified successfully! Redirecting to login...");
        setTimeout(() => router.push("/login"), 3000);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.message);
      });
  }, [token, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-6">
      <div className="max-w-md w-full bg-white p-10 shadow-2xl rounded-3xl text-center">
        {status === "loading" && <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={48} />}
        {status === "success" && <CheckCircle2 className="text-emerald-600 mx-auto mb-4" size={48} />}
        {status === "error" && <XCircle className="text-rose-600 mx-auto mb-4" size={48} />}
        
        <h2 className="text-2xl font-black text-slate-900 mb-2">Email Verification</h2>
        <p className="text-slate-600 mb-6 font-medium">{message}</p>
        
        <Link href="/login" className="inline-block py-3 px-6 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700">
          Go to Login
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}