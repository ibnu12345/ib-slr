"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  User,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  KeyRound,
  ExternalLink,
} from "lucide-react";
import {
  registerAction,
  verifyEmailAction,
  resendVerificationOtpAction,
} from "../../lib/auth/actions";
import { useLanguage } from "../../components/i18n/LanguageContext";

export default function RegisterPage() {
  const router = useRouter();
  const { isId } = useLanguage();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    token: string;
    email: string;
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  // OTP Verification States
  const [otpInput, setOtpInput] = useState("");
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resending, setResending] = useState(false);
  const [resendNotice, setResendNotice] = useState<string | null>(null);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (!successData || resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [successData, resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!acceptTerms) {
      setError(
        isId
          ? "Anda wajib menyetujui Syarat & Ketentuan serta Kebijakan Privasi untuk mendaftar."
          : "You must accept the Terms of Service and Privacy Policy to continue."
      );
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
        setError(res.error || (isId ? "Pendaftaran gagal." : "Registration failed."));
      } else {
        setSuccessData({
          token: res.verificationToken || "",
          email: res.email || email,
          message:
            res.message ||
            (isId
              ? "Akun berhasil dibuat! Silakan verifikasi email Anda."
              : "Account created! Please verify your email."),
        });
        setResendCooldown(60);
      }
    } catch {
      setError(
        isId
          ? "Terjadi kesalahan koneksi atau server saat pendaftaran."
          : "An unexpected network or server error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);
    setResendNotice(null);

    const clean = otpInput.trim();
    if (!clean) {
      setOtpError(
        isId
          ? "Silakan masukkan 6 digit kode OTP verifikasi."
          : "Please enter the 6-digit verification OTP code."
      );
      return;
    }

    setOtpVerifying(true);
    try {
      const res = await verifyEmailAction(clean);
      if (!res.success) {
        setOtpError(
          res.error ||
            (isId
              ? "Kode OTP verifikasi tidak valid atau telah kadaluarsa."
              : "Invalid or expired OTP code.")
        );
      } else {
        setOtpSuccess(true);
        setTimeout(() => {
          router.push("/app");
        }, 1500);
      }
    } catch {
      setOtpError(
        isId
          ? "Gagal menghubungi server untuk memverifikasi OTP."
          : "Server error during OTP verification."
      );
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || !successData?.email || resending) return;
    setResending(true);
    setOtpError(null);
    setResendNotice(null);

    try {
      const res = await resendVerificationOtpAction(successData.email);
      if (res.success) {
        setResendNotice(
          isId
            ? "Kode OTP verifikasi baru telah dikirim ke Gmail Anda."
            : "A new OTP code has been sent to your Gmail."
        );
        setResendCooldown(60);
        if (res.token) {
          setSuccessData((prev) => (prev ? { ...prev, token: res.token! } : null));
        }
      } else {
        setOtpError(res.error || "Gagal mengirim ulang OTP.");
      }
    } catch {
      setOtpError(isId ? "Gagal mengirim ulang OTP." : "Failed to resend OTP.");
    } finally {
      setResending(false);
    }
  };

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
            {successData
              ? isId
                ? "Verifikasi Email Akun Anda"
                : "Verify Your Email Account"
              : isId
              ? "Daftar Akun IB-SLR Baru"
              : "Create your IB-SLR Account"}
          </h1>
          <p className="text-xs text-[#667085] mt-1">
            {successData
              ? isId
                ? "Langkah wajib untuk verifikasi identitas riset dan mencegah akun bot/spam"
                : "Mandatory security step to prevent automated spam and protect SLR data integrity"
              : isId
              ? "Mulai tinjauan pustaka sistematis dengan asistensi AI berakar sitasi nyata"
              : "Start managing systematic reviews with verifiable AI assistance"}
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
          <div className="space-y-5">
            {/* Success creation message */}
            <div className="bg-[#ECFDF3] border border-[#18794E]/30 rounded-lg p-3.5 text-xs text-[#18794E] space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#18794E]" />
                <span>{isId ? "Akun Anda Siap Diverifikasi!" : "Account Ready for Verification!"}</span>
              </div>
              <p className="text-[#17212B] text-xs leading-relaxed">
                {isId
                  ? "Kode OTP verifikasi 6 digit telah dikirimkan ke alamat email:"
                  : "A 6-digit verification OTP code has been dispatched to:"}
              </p>
              <div className="font-mono font-bold text-[#17324D] bg-[#FFFFFF] px-2.5 py-1 rounded border border-[#18794E]/20 text-xs inline-block">
                {successData.email}
              </div>
            </div>

            {/* OTP Status alerts */}
            {otpError && (
              <div className="bg-[#FEF3F2] border border-[#B42318]/30 rounded-lg p-3 text-xs text-[#B42318] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{otpError}</span>
              </div>
            )}

            {resendNotice && (
              <div className="bg-[#EFF8FF] border border-[#2E90FA]/30 rounded-lg p-3 text-xs text-[#175CD3] flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{resendNotice}</span>
              </div>
            )}

            {otpSuccess ? (
              <div className="p-4 bg-[#ECFDF3] border border-[#18794E]/40 rounded-lg text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#18794E] mx-auto animate-bounce" />
                <h3 className="text-sm font-bold text-[#18794E]">
                  {isId ? "Verifikasi Berhasil!" : "Verification Successful!"}
                </h3>
                <p className="text-xs text-[#17212B]">
                  {isId
                    ? "Email Anda terverifikasi. Mengarahkan Anda ke Research Workspace..."
                    : "Your email is verified. Redirecting to Research Workspace..."}
                </p>
              </div>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#17212B] flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-[#2F7D78]" />
                      <span>{isId ? "Masukkan 6-Digit Kode OTP" : "Enter 6-Digit OTP Code"}</span>
                    </label>
                    <span className="text-[11px] text-[#667085]">
                      {isId ? "Cek Inbox / Spam Gmail" : "Check Inbox / Spam"}
                    </span>
                  </div>

                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    required
                    autoFocus
                    value={otpInput}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setOtpInput(val);
                    }}
                    placeholder="123456"
                    className="w-full text-center font-mono text-2xl font-bold tracking-[10px] py-2.5 px-3 bg-[#FFFFFF] border-2 border-[#17324D]/30 focus:border-[#2F7D78] rounded-xl outline-none transition-all shadow-inner"
                  />
                  <p className="text-[11px] text-[#667085] mt-1.5 text-center">
                    {isId
                      ? "Masukkan 6 angka yang dikirimkan ke Gmail Anda."
                      : "Enter the 6 numbers received in your Gmail."}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={otpVerifying || otpInput.trim().length < 6}
                  className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#2F7D78] hover:bg-[#266662] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  {otpVerifying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{isId ? "Memverifikasi Kode OTP..." : "Verifying OTP..."}</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>{isId ? "Verifikasi Akun Sekarang" : "Verify Account Now"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="pt-2 border-t border-[#E4E7EC] flex flex-col items-center gap-2 text-xs">
                  <div className="flex items-center justify-between w-full text-xs text-[#667085]">
                    <span>{isId ? "Belum menerima kode OTP?" : "Didn't receive the OTP?"}</span>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendCooldown > 0 || resending}
                      className="inline-flex items-center gap-1 font-semibold text-[#2F7D78] hover:underline disabled:text-[#98A2B3] disabled:no-underline"
                    >
                      <RefreshCw className={`w-3 h-3 ${resending ? "animate-spin" : ""}`} />
                      <span>
                        {resendCooldown > 0
                          ? `${isId ? "Kirim Ulang dalam" : "Resend in"} (${resendCooldown}s)`
                          : isId
                          ? "Kirim Ulang Kode OTP"
                          : "Resend OTP"}
                      </span>
                    </button>
                  </div>

                  {successData.token && (
                    <div className="w-full pt-1">
                      <Link
                        href={`/verify-email?token=${successData.token}`}
                        className="text-[11px] text-[#667085] hover:text-[#2F7D78] flex items-center justify-center gap-1 hover:underline text-center"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>
                          {isId
                            ? "Atau verifikasi langsung via tautan URL"
                            : "Or verify directly via token link"}
                        </span>
                      </Link>
                    </div>
                  )}
                </div>
              </form>
            )}
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
                {isId ? "Email Akademik / Gmail" : "Academic or Gmail Address"}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#667085] absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="peneliti@gmail.com"
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
