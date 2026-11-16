"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, User } from "lucide-react";
import { loginAction } from "../../lib/auth/actions";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  const fillCredentials = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setError(null);
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-[#FFFFFF] p-8 rounded-xl border border-[#E4E7EC] shadow-sm">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-[#17324D] flex items-center justify-center text-white mx-auto mb-4">
            <BookOpen className="w-6 h-6 text-[#3E9C96]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#17324D]">
            Sign in to IB-SLR
          </h1>
          <p className="text-xs text-[#667085] mt-1">
            Access your systematic literature review workspace
          </p>
        </div>

        {/* Demo Credentials Helper Pill */}
        <div className="bg-[#EFF7F6] border border-[#2F7D78]/20 rounded-lg p-3 text-xs text-[#17324D] space-y-1.5">
          <div className="font-semibold flex items-center gap-1.5 text-[#2F7D78]">
            <ShieldCheck className="w-4 h-4" />
            <span>Evaluation Demo Credentials:</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => fillCredentials("admin@ib-slr.local", "AdminPass123!")}
              className="px-2 py-1 bg-white hover:bg-[#F7F8FA] border border-[#2F7D78]/30 rounded text-[11px] font-medium transition-colors"
            >
              Fill Admin Account
            </button>
            <button
              type="button"
              onClick={() => fillCredentials("researcher@ib-slr.local", "ResearchPass123!")}
              className="px-2 py-1 bg-white hover:bg-[#F7F8FA] border border-[#2F7D78]/30 rounded text-[11px] font-medium transition-colors"
            >
              Fill Researcher Account
            </button>
          </div>
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
              Email Address
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
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-[#2F7D78] hover:underline font-medium"
              >
                Forgot password?
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
            {loading ? "Signing in..." : "Sign In"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-[#667085]">
          Don&apos;t have an account yet?{" "}
          <Link href="/register" className="text-[#2F7D78] hover:underline font-semibold">
            Create an account
          </Link>
        </div>

        {/* DEMO / TEST ACCOUNTS BOX - PROMINENTLY POSITIONED AT THE BOTTOM */}
        <div className="mt-6 pt-6 border-t-2 border-dashed border-[#E4E7EC] space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#17324D]">
            <ShieldCheck className="w-4 h-4 text-[#2F7D78]" />
            <span>Akun Uji Coba Siap Pakai (Klik untuk Isi Otomatis):</span>
          </div>

          <div className="space-y-2 text-xs">
            {/* Admin Account Card */}
            <div className="p-3 rounded-lg bg-[#EFF7F6] border border-[#2F7D78]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-bold text-[#17324D] block text-[11px] uppercase tracking-wider">
                  1. Administrator (Akses Penuh /admin CMS)
                </span>
                <div className="text-[11px] text-[#667085] font-mono mt-0.5">
                  Email: <span className="font-semibold text-[#17212B]">admin@ib-slr.local</span>
                </div>
                <div className="text-[11px] text-[#667085] font-mono">
                  Password: <span className="font-semibold text-[#17212B]">AdminPass123!</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => fillCredentials("admin@ib-slr.local", "AdminPass123!")}
                className="px-2.5 py-1.5 bg-[#2F7D78] hover:bg-[#266662] text-white rounded text-[11px] font-semibold transition-colors shrink-0"
              >
                Gunakan Akun Ini
              </button>
            </div>

            {/* Researcher Account Card */}
            <div className="p-3 rounded-lg bg-[#F7F8FA] border border-[#E4E7EC] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-bold text-[#17324D] block text-[11px] uppercase tracking-wider">
                  2. Peneliti Terverifikasi (Akses /app Workspace)
                </span>
                <div className="text-[11px] text-[#667085] font-mono mt-0.5">
                  Email: <span className="font-semibold text-[#17212B]">researcher@ib-slr.local</span>
                </div>
                <div className="text-[11px] text-[#667085] font-mono">
                  Password: <span className="font-semibold text-[#17212B]">ResearchPass123!</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => fillCredentials("researcher@ib-slr.local", "ResearchPass123!")}
                className="px-2.5 py-1.5 bg-[#17324D] hover:bg-[#12273D] text-white rounded text-[11px] font-semibold transition-colors shrink-0"
              >
                Gunakan Akun Ini
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
