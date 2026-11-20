"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BookOpen, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, KeyRound } from "lucide-react";
import { verifyEmailAction } from "../../lib/auth/actions";
import { useLanguage } from "../../components/i18n/LanguageContext";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get("token") || "";
  const { isId } = useLanguage();

  const [tokenInput, setTokenInput] = useState(tokenParam);
  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const performVerification = async (tok: string) => {
    if (!tok.trim()) {
      setStatus("error");
      setErrorMessage(
        isId
          ? "Silakan masukkan kode OTP 6 digit atau token verifikasi yang valid."
          : "Please provide a valid 6-digit OTP or verification token."
      );
      return;
    }

    setStatus("verifying");
    setErrorMessage("");

    try {
      const res = await verifyEmailAction(tok.trim());
      if (!res.success) {
        setStatus("error");
        setErrorMessage(
          res.error ||
            (isId
              ? "Verifikasi email gagal. Kode tidak valid atau telah kadaluarsa."
              : "Email verification failed.")
        );
      } else {
        setStatus("success");
        setSuccessMessage(
          res.message ||
            (isId
              ? "Email berhasil diverifikasi! Akun Anda aktif dan aman."
              : "Email verified successfully!")
        );
      }
    } catch {
      setStatus("error");
      setErrorMessage(
        isId
          ? "Terjadi kesalahan server saat proses verifikasi."
          : "An unexpected server error occurred during verification."
      );
    }
  };

  useEffect(() => {
    if (tokenParam) {
      performVerification(tokenParam);
    }
  }, [tokenParam]);

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-[#FFFFFF] p-8 rounded-xl border border-[#E4E7EC] shadow-sm">
        <div className="text-center">
          <Link href="/" className="inline-block mb-3">
            <img
              src="/logo-icon.png"
              alt="IB-SLR Logo"
              className="w-16 h-16 object-contain mx-auto"
            />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-[#17324D]">
            {isId ? "Verifikasi Email Akun" : "Email Verification"}
          </h1>
          <p className="text-xs text-[#667085] mt-1">
            {isId
              ? "Pemeriksaan keamanan wajib untuk integritas data riset SLR dan anti-spam"
              : "Mandatory research integrity security check to prevent spam"}
          </p>
        </div>

        {status === "verifying" && (
          <div className="p-4 bg-[#F7F8FA] border border-[#E4E7EC] rounded-lg text-center space-y-2">
            <div className="w-6 h-6 border-2 border-[#2F7D78] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[#17212B] font-medium">
              {isId ? "Memverifikasi kode OTP / token..." : "Verifying your token..."}
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="p-5 bg-[#ECFDF3] border border-[#18794E]/30 rounded-lg text-center space-y-4">
            <CheckCircle2 className="w-8 h-8 text-[#18794E] mx-auto animate-bounce" />
            <div>
              <h2 className="text-sm font-bold text-[#18794E] mb-1">
                {isId ? "Verifikasi Selesai!" : "Verification Complete"}
              </h2>
              <p className="text-xs text-[#17212B]">{successMessage}</p>
            </div>
            <Link
              href="/app"
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg text-xs font-semibold text-white bg-[#17324D] hover:bg-[#12273D] transition-colors"
            >
              <span>{isId ? "Masuk ke Workspace Riset" : "Enter Research Workspace"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="p-4 bg-[#FEF3F2] border border-[#B42318]/30 rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-xs text-[#B42318] font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {status !== "success" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              performVerification(tokenInput);
            }}
            className="space-y-4 pt-2"
          >
            <div>
              <label className="block text-xs font-semibold text-[#17212B] mb-1 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#2F7D78]" />
                <span>
                  {isId
                    ? "Masukkan 6-Digit Kode OTP atau Token Verifikasi"
                    : "Enter 6-Digit OTP Code or Verification Token"}
                </span>
              </label>
              <input
                type="text"
                required
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder={isId ? "Contoh: 849201 atau token tautan" : "e.g. 849201 or token"}
                className="w-full px-3 py-2 text-sm bg-[#FFFFFF] border border-[#E4E7EC] rounded-lg transition-colors font-mono tracking-wider"
              />
              <p className="text-[11px] text-[#667085] mt-1">
                {isId
                  ? "Kode 6 angka dikirimkan ke email Gmail Anda saat pendaftaran."
                  : "The 6-digit code was sent to your Gmail inbox upon registration."}
              </p>
            </div>
            <button
              type="submit"
              disabled={status === "verifying"}
              className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-[#17324D] hover:bg-[#12273D] disabled:opacity-50 transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isId ? "Verifikasi Sekarang" : "Verify Token"}</span>
            </button>
          </form>
        )}

        <div className="text-center pt-2 text-xs text-[#667085]">
          {isId ? "Ingin masuk ke akun lain?" : "Need to sign in to another account?"}{" "}
          <Link href="/login" className="text-[#2F7D78] hover:underline font-semibold">
            {isId ? "Kembali ke login" : "Return to login"}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-[#667085]">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}

