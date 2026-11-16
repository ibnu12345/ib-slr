"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Lock, Mail, User, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { registerAction } from "../../lib/auth/actions";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ token: string; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!acceptTerms) {
      setError("You must accept the Terms of Service and Privacy Policy to continue.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("acceptTerms", "true");

    try {
      const res = await registerAction(formData);
      if (!res.success) {
        setError(res.error || "Registration failed.");
      } else {
        setSuccessData({
          token: res.verificationToken || "",
          message: res.message || "Registration successful!",
        });
      }
    } catch {
      setError("An unexpected network or server error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-[#FFFFFF] p-8 rounded-xl border border-[#E4E7EC] shadow-sm">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-[#17324D] flex items-center justify-center text-white mx-auto mb-4">
            <BookOpen className="w-6 h-6 text-[#3E9C96]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#17324D]">
            Create your IB-SLR Account
          </h1>
          <p className="text-xs text-[#667085] mt-1">
            Start managing systematic reviews with verifiable AI assistance
          </p>
        </div>

        {error && (
          <div className="bg-[#FEF3F2] border border-[#B42318]/30 rounded-lg p-3 text-xs text-[#B42318] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successData ? (
          <div className="space-y-4">
            <div className="bg-[#ECFDF3] border border-[#18794E]/30 rounded-lg p-4 text-xs text-[#18794E] space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>{successData.message}</span>
              </div>
              <p className="text-[#17212B] leading-relaxed">
                An email verification token has been generated. Before accessing research data and running AI extractions, your email must be verified.
              </p>
            </div>

            <div className="bg-[#F7F8FA] border border-[#E4E7EC] p-3 rounded-lg text-xs space-y-2">
              <span className="font-semibold text-[#17324D] block">
                Verification Simulation (Local Development):
              </span>
              <p className="text-[#667085]">
                Click below to instantly complete email verification:
              </p>
              <Link
                href={`/verify-email?token=${successData.token}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2F7D78] text-white rounded font-semibold text-xs hover:bg-[#266662] transition-colors"
              >
                <span>Verify Email Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#17212B] mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#667085] absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Dr. Jane Smith"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#FFFFFF] border border-[#E4E7EC] rounded-lg transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17212B] mb-1">
                Academic or Institutional Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#667085] absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane.smith@institution.edu"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#FFFFFF] border border-[#E4E7EC] rounded-lg transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17212B] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#667085] absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters (1 uppercase, 1 number)"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#FFFFFF] border border-[#E4E7EC] rounded-lg transition-colors"
                />
              </div>
              <p className="text-[11px] text-[#667085] mt-1">
                Must contain at least 8 characters, an uppercase letter, and a number.
              </p>
            </div>

            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                required
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-0.5 rounded border-[#E4E7EC] text-[#2F7D78] focus:ring-[#2F7D78]"
              />
              <label htmlFor="terms" className="text-xs text-[#667085] leading-snug">
                I agree to the{" "}
                <Link href="/terms" className="text-[#2F7D78] hover:underline font-medium">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-[#2F7D78] hover:underline font-medium">
                  Privacy Policy
                </Link>
                .
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-[#17324D] hover:bg-[#12273D] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? "Creating account..." : "Register Account"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        )}

        <div className="text-center pt-2 text-xs text-[#667085]">
          Already have an account?{" "}
          <Link href="/login" className="text-[#2F7D78] hover:underline font-semibold">
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
}
