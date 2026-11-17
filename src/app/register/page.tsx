"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Lock, Mail, User, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { registerAction } from "../../lib/auth/actions";
import { useLanguage } from "../../components/i18n/LanguageContext";

export default function RegisterPage() {
  const router = useRouter();
  const { isId } = useLanguage();
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
            {isId ? "Daftar Akun IB-SLR Baru" : "Create your IB-SLR Account"}
          </h1>
          <p className="text-xs text-[#667085] mt-1">
            {isId ? "Mulai tinjauan pustaka sistematis dengan asistensi AI berakar sitasi nyata" : "Start managing systematic reviews with verifiable AI assistance"}
          </p>
        </div>

        {error && (
          <div className="bg-[#FEF3F2] border border-[#B42318]/30 rounded-lg p-3 text-xs text-[#B42318] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {!successData && (
          <>
            <a
              href="/api/auth/google"
              className="w-full py-2.5 px-4 border border-[#D0D5DD] rounded-xl text-xs font-semibold text-[#344054] hover:bg-[#F9FAFB] transition-colors flex items-center justify-center gap-3 shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isId ? "Daftar Instan dengan Akun Google" : "Instant Sign up with Google"}</span>
            </a>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-[#E4E7EC]"></div>
              <span className="flex-shrink mx-3 text-[11px] text-[#667085] uppercase">
                {isId ? "atau daftar dengan form" : "or register with form"}
              </span>
              <div className="flex-grow border-t border-[#E4E7EC]"></div>
            </div>
          </>
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
                {isId ? "Nama Lengkap" : "Full Name"}
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
                {isId ? "Email Akademik / Institusi" : "Academic or Institutional Email"}
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
                {isId ? "Kata Sandi" : "Password"}
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
                {isId ? "Minimal 8 karakter, mengandung huruf besar dan angka." : "Must contain at least 8 characters, an uppercase letter, and a number."}
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
                {isId ? "Saya menyetujui " : "I agree to the "}
                <Link href="/terms" className="text-[#2F7D78] hover:underline font-medium">
                  {isId ? "Syarat & Ketentuan" : "Terms of Service"}
                </Link>{" "}
                {isId ? "dan " : "and "}
                <Link href="/privacy" className="text-[#2F7D78] hover:underline font-medium">
                  {isId ? "Kebijakan Privasi" : "Privacy Policy"}
                </Link>
                .
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-[#17324D] hover:bg-[#12273D] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (isId ? "Mendaftarkan..." : "Creating account...") : (isId ? "Daftar Akun Baru" : "Register Account")}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        )}

        <div className="text-center pt-2 text-xs text-[#667085]">
          {isId ? "Sudah memiliki akun?" : "Already have an account?"}{" "}
          <Link href="/login" className="text-[#2F7D78] hover:underline font-semibold">
            {isId ? "Masuk di sini" : "Log in here"}
          </Link>
        </div>
      </div>
    </div>
  );
}
