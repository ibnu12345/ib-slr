"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Lock, Mail, AlertCircle, ArrowRight } from "lucide-react";
import { loginAction } from "../../lib/auth/actions";
import { useLanguage } from "../../components/i18n/LanguageContext";

export default function LoginPage() {
  const router = useRouter();
  const { isId } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const err = params.get("error");
      if (err) {
        if (err === "GoogleAuthFailed") {
          setError(isId ? "Autentikasi Google dibatalkan atau gagal." : "Google authentication was cancelled or failed.");
        } else if (err === "GoogleTokenExchangeFailed") {
          setError(isId ? "Gagal memverifikasi token Google. Silakan coba lagi." : "Failed to exchange Google token. Please try again.");
        } else if (err === "GoogleProfileFetchFailed") {
          setError(isId ? "Gagal mengambil profil akun Google Anda." : "Failed to retrieve your Google profile.");
        } else if (err === "GoogleAuthException") {
          setError(isId ? "Terjadi kesalahan sistem saat memproses login Google." : "System error occurred during Google sign in.");
        } else {
          setError(err);
        }
      }
    }
  }, [isId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    try {
      const res = await loginAction(formData);
      if (!res.success) {
        setError(res.error || "Login failed. Please check your credentials.");
      } else {
        if (res.user?.role === "admin" || res.user?.role === "super_admin") {
          router.push("/admin");
        } else {
          router.push("/app");
        }
        router.refresh();
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
            {isId ? "Masuk ke IB-SLR" : "Sign in to IB-SLR"}
          </h1>
          <p className="text-xs text-[#667085] mt-1">
            {isId ? "Akses ruang kerja tinjauan pustaka sistematis Anda" : "Access your systematic literature review workspace"}
          </p>
        </div>

        {/* Google OAuth One-Click Button */}
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
          <span>{isId ? "Lanjutkan dengan Akun Google" : "Continue with Google Account"}</span>
        </a>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-[#E4E7EC]"></div>
          <span className="flex-shrink mx-3 text-[11px] text-[#667085] uppercase">
            {isId ? "atau masuk dengan email" : "or sign in with email"}
          </span>
          <div className="flex-grow border-t border-[#E4E7EC]"></div>
        </div>

        {error && (
          <div className="bg-[#FEF3F2] border border-[#B42318]/30 rounded-lg p-3 text-xs text-[#B42318] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#17212B] mb-1">
              {isId ? "Alamat Email" : "Email Address"}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#667085] absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#FFFFFF] border border-[#E4E7EC] rounded-lg transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#17212B]">
                {isId ? "Kata Sandi" : "Password"}
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-[#2F7D78] hover:underline font-medium"
              >
                {isId ? "Lupa kata sandi?" : "Forgot password?"}
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#667085] absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#FFFFFF] border border-[#E4E7EC] rounded-lg transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-[#17324D] hover:bg-[#12273D] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? (isId ? "Sedang masuk..." : "Signing in...") : (isId ? "Masuk ke Workspace" : "Sign In")}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-[#667085]">
          {isId ? "Belum punya akun?" : "Don't have an account yet?"}{" "}
          <Link href="/register" className="text-[#2F7D78] hover:underline font-semibold">
            {isId ? "Daftar sekarang gratis" : "Create an account"}
          </Link>
        </div>
      </div>
    </div>
  );
}
