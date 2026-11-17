"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Receipt,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { UserQuotaInfo } from "../../lib/types/payment";
import { QrisCheckoutModal } from "./QrisCheckoutModal";

interface Props {
  quota: UserQuotaInfo;
  isId?: boolean;
}

export function AccountQuotaCard({ quota: initialQuota, isId = true }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [quota, setQuota] = useState<UserQuotaInfo>(initialQuota);

  const refreshQuota = async () => {
    try {
      const res = await fetch("/api/payment/quota");
      const data = await res.json();
      if (data.success && data.quota) {
        setQuota(data.quota);
      }
    } catch {
      // ignore
    }
  };

  const usagePercent = quota.isAdmin
    ? 10
    : Math.min(100, Math.round((quota.usedQuota / Math.max(1, quota.totalQuota)) * 100));

  const isFull = !quota.canCreateNewProject && !quota.isAdmin;

  return (
    <>
      <div className="no-print my-6 bg-[#FFFFFF] border border-[#E4E7EC] rounded-2xl shadow-sm overflow-hidden">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-[#17324D] to-[#244A70] px-5 py-3 text-white flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#3E9C96]" />
            <span className="text-xs font-bold uppercase tracking-wider">
              {isId ? "Status Akun & Kuota Langganan" : "Account Status & Quota Plan"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#2F7D78] text-white">
              {quota.planName}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-gray-200">
              {quota.planBadge}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left Column: Plan & Quota Details (7 cols) */}
          <div className="md:col-span-7 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-[#17324D] flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#2F7D78]" />
                  {isId ? "Penggunaan Kuota Proyek Aktif" : "Active Project Slot Usage"}
                </span>
                <span className="text-xs font-bold text-[#17324D]">
                  {quota.isAdmin
                    ? (isId ? "Tak Terbatas (Admin)" : "Unlimited (Admin)")
                    : `${quota.usedQuota} / ${quota.totalQuota} ${isId ? "Proyek Digunakan" : "Projects Used"}`}
                </span>
              </div>

              {/* Progress Bar */}
              {!quota.isAdmin && (
                <div className="w-full bg-[#F2F4F7] h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      isFull ? "bg-[#D92D20]" : usagePercent > 70 ? "bg-[#B7791F]" : "bg-[#18794E]"
                    }`}
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
              )}
            </div>

            {/* Quota Breakdown Tags */}
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <span className="px-2.5 py-1 rounded-md bg-[#EFF7F6] text-[#2F7D78] font-medium border border-[#2F7D78]/20 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {isId ? "1 Proyek Bawaan Gratis" : "1 Base Free Project"}
              </span>

              {quota.purchasedQuota > 0 && (
                <span className="px-2.5 py-1 rounded-md bg-[#ECFDF3] text-[#18794E] font-medium border border-[#18794E]/20 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-[#18794E]" />
                  {isId
                    ? `+${quota.purchasedQuota} Slot Ekstra (QRIS Rp 20.000)`
                    : `+${quota.purchasedQuota} Extra Pass (QRIS)`}
                </span>
              )}

              {isFull ? (
                <span className="px-2.5 py-1 rounded-md bg-[#FEF3F2] text-[#B42318] font-bold border border-[#B42318]/25 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {isId ? "Kuota Proyek Penuh" : "Project Quota Full"}
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-md bg-[#F0F9FF] text-[#026AA2] font-semibold border border-[#026AA2]/20">
                  {isId
                    ? `Tersisa ${quota.remainingQuota} Slot Proyek Aktif`
                    : `${quota.remainingQuota} Active Slot Available`}
                </span>
              )}
            </div>

            <p className="text-xs text-[#667085] leading-relaxed">
              {isId
                ? "Sistem ini menggunakan model Pay-Per-Project Pass: Anda dapat membuat 1 proyek aktif gratis, dan menambah slot aktif kapan saja seharga Rp 20.000 per proyek tanpa langganan bulanan."
                : "IB-SLR uses a Pay-Per-Project Pass model: start with 1 free active project, and unlock extra active slots anytime for Rp 20,000 (~$1.30) each via instant QRIS."}
            </p>
          </div>

          {/* Right Column: CTA Buttons & Billing Link (5 cols) */}
          <div className="md:col-span-5 flex flex-col gap-2.5 sm:border-l sm:border-[#E4E7EC] sm:pl-6">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#17324D] hover:bg-[#12273D] text-white text-xs font-semibold shadow-sm transition-all"
            >
              <QrCode className="w-4 h-4 text-[#3E9C96]" />
              <span>{isId ? "Beli 1X Proyek Baru (QRIS)" : "Buy 1X Project Pass"}</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#18794E] text-white font-bold">
                Rp 20k
              </span>
            </button>

            <Link
              href="/app/billing"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-[#E4E7EC] text-xs font-medium text-[#17324D] hover:bg-[#F7F8FA] transition-colors"
            >
              <Receipt className="w-3.5 h-3.5 text-[#2F7D78]" />
              <span>{isId ? "Riwayat Transaksi & Faktur" : "Billing & Invoice History"}</span>
              {quota.paidOrdersCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#EFF7F6] text-[#2F7D78] font-bold">
                  {quota.paidOrdersCount}
                </span>
              )}
              <ArrowRight className="w-3 h-3 text-[#667085]" />
            </Link>
          </div>
        </div>
      </div>

      <QrisCheckoutModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={async () => {
          await refreshQuota();
          window.location.reload();
        }}
      />
    </>
  );
}
