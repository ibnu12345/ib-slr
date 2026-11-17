"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2, Sparkles, Key } from "lucide-react";

export default function GoogleAuthSimulationPage() {
  const router = useRouter();
  const [customEmail, setCustomEmail] = useState("ibnusetiawan1928@gmail.com");
  const [customName, setCustomName] = useState("Ibnu (Owner)");
  const [loading, setLoading] = useState(false);

  const handleInstantSignIn = async (email: string, name: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/google/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, fullName: name }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.role === "admin" || data.role === "super_admin") {
          router.push("/admin");
        } else {
          router.push("/app");
        }
        router.refresh();
      }
    } catch (err) {
      console.error(err);
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
            Pilih akun Google Anda untuk melanjutkan ke <strong>IB-SLR Research Platform</strong>
          </p>
        </div>

        {/* One-Tap Account Options */}
        <div className="space-y-3">
          {/* Owner Super Admin Option */}
          <button
            type="button"
            disabled={loading}
            onClick={() => handleInstantSignIn("ibnusetiawan1928@gmail.com", "Ibnu Setiawan (Owner)")}
            className="w-full p-3.5 rounded-xl border-2 border-[#2F7D78]/30 hover:border-[#2F7D78] hover:bg-[#EFF7F6] text-left transition-all flex items-center justify-between group shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#17324D] text-[#3E9C96] font-bold flex items-center justify-center text-sm">
                IS
              </div>
              <div>
                <div className="text-xs font-bold text-[#17324D] flex items-center gap-1.5">
                  <span>Ibnu Setiawan</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#18794E] text-white font-semibold">
                    Owner Super Admin
                  </span>
                </div>
                <div className="text-[11px] text-[#667085]">ibnusetiawan1928@gmail.com</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#2F7D78] group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Pro VIP Researcher Option */}
          <button
            type="button"
            disabled={loading}
            onClick={() => handleInstantSignIn("pro@ib-slr.com", "Dr. Ibnu (Pro VIP)")}
            className="w-full p-3.5 rounded-xl border border-[#E4E7EC] hover:border-[#2F7D78] hover:bg-[#F7F8FA] text-left transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#2F7D78] text-white font-bold flex items-center justify-center text-sm">
                VIP
              </div>
              <div>
                <div className="text-xs font-bold text-[#17324D] flex items-center gap-1.5">
                  <span>Dr. Ibnu (Pro VIP)</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#2F7D78] text-white font-semibold">
                    Free Pro Lifetime
                  </span>
                </div>
                <div className="text-[11px] text-[#667085]">pro@ib-slr.com</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#667085] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Custom Google Email Form */}
        <div className="pt-4 border-t border-[#E4E7EC] space-y-3">
          <span className="text-[11px] font-semibold text-[#667085] block">
            Atau gunakan alamat Google lain:
          </span>
          <input
            type="email"
            value={customEmail}
            onChange={(e) => setCustomEmail(e.target.value)}
            placeholder="nama@gmail.com"
            className="w-full px-3.5 py-2 text-xs border border-[#E4E7EC] rounded-lg"
          />
          <button
            type="button"
            disabled={loading || !customEmail}
            onClick={() => handleInstantSignIn(customEmail, customName || customEmail.split("@")[0])}
            className="w-full py-2.5 rounded-xl bg-[#17324D] hover:bg-[#12273D] text-white text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <span>{loading ? "Menghubungkan..." : "Masuk dengan Email Ini"}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#3E9C96]" />
          </button>
        </div>

        {/* Return to Login */}
        <div className="text-center">
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
