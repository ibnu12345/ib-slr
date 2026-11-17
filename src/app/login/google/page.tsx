"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, ShieldCheck, ArrowRight, ArrowLeft, Mail, Lock, AlertCircle } from "lucide-react";

export default function GoogleAuthSimulationPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isOwnerEmail =
    email.toLowerCase().includes("ibnusetiawan1928") ||
    email.toLowerCase() === "admin@ib-slr.com" ||
    email.toLowerCase() === "pro@ib-slr.com";

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/google/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          fullName: fullName.trim() || email.split("@")[0],
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Gagal masuk dengan akun Google.");
      } else {
        if (data.role === "admin" || data.role === "super_admin") {
          router.push("/admin");
        } else {
          router.push("/app");
        }
        router.refresh();
      }
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="max-w-md w-full bg-white border border-[#E4E7EC] rounded-2xl shadow-lg p-8 space-y-6">
        {/* Google Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center mx-auto mb-4 bg-white shadow-sm">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
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
          </div>
          <h1 className="text-xl font-bold text-[#17324D]">Masuk dengan Akun Google</h1>
          <p className="text-xs text-[#667085] mt-1">
            Gunakan akun Gmail Anda untuk melanjutkan ke <strong>IB-SLR Research Platform</strong>
          </p>
        </div>

        {error && (
          <div className="bg-[#FEF3F2] border border-[#B42318]/30 rounded-lg p-3 text-xs text-[#B42318] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#17212B] mb-1">
              Alamat Email Google / Gmail
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#667085] absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@gmail.com"
                className="w-full pl-9 pr-3.5 py-2 text-xs border border-[#E4E7EC] rounded-lg text-[#17212B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17212B] mb-1">
              Nama Lengkap Anda
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Contoh: Dr. Budi Santoso"
              className="w-full px-3.5 py-2 text-xs border border-[#E4E7EC] rounded-lg text-[#17212B]"
            />
          </div>

          {isOwnerEmail && (
            <div className="p-3 bg-[#EFF7F6] border border-[#2F7D78]/30 rounded-xl space-y-2">
              <span className="text-xs font-bold text-[#17324D] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#2F7D78]" />
                Verifikasi Hak Akses Khusus Owner
              </span>
              <p className="text-[11px] text-[#667085]">
                Alamat ini terdaftar sebagai akun Super Admin / Pro VIP. Masukkan kata sandi Anda untuk konfirmasi keamanan:
              </p>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#667085] absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Kata sandi akun..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#2F7D78]/30 rounded-lg"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-[#17324D] hover:bg-[#12273D] text-white text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <span>{loading ? "Menghubungkan..." : "Lanjutkan Masuk"}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#3E9C96]" />
          </button>
        </form>

        {/* Return to Login */}
        <div className="text-center pt-2 border-t border-[#E4E7EC]">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-xs text-[#667085] hover:text-[#17324D]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke halaman login biasa</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
