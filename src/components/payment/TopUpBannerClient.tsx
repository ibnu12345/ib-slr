"use client";

import React, { useState } from "react";
import { ArrowRight, Sparkles, QrCode, Zap, Crown } from "lucide-react";
import { QrisCheckoutModal } from "./QrisCheckoutModal";

interface Props {
  isId?: boolean;
}

export function TopUpBannerClient({ isId = true }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("pay_per_project");

  const openCheckout = (planKey: string) => {
    setSelectedPlan(planKey);
    setModalOpen(true);
  };

  return (
    <>
      <div className="no-print my-6 p-5 rounded-2xl bg-gradient-to-r from-[#EFF7F6] via-white to-[#EFF7F6] border border-[#2F7D78]/25 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#17324D] text-[#3E9C96] flex items-center justify-center shrink-0 shadow-sm">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-[#17324D]">
                {isId ? "Opsi Top-Up Kuota & Upgrade Paket" : "Quota Top-Up & Plan Upgrade"}
              </h4>
              <span className="px-2 py-0.5 rounded text-[10px] bg-[#18794E] text-white font-bold">
                $1.30 ≈ Rp 20.000
              </span>
            </div>
            <p className="text-xs text-[#667085] mt-1 max-w-xl leading-relaxed">
              {isId
                ? "Beli 1X Active Project Pass secara fleksibel kapan saja, atau aktifkan paket Professional Researcher untuk mendapatkan slot proyek tanpa batas (unlimited)."
                : "Buy 1X Active Project Pass anytime without subscriptions, or upgrade to Professional Researcher for unlimited systematic review projects."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={() => openCheckout("pay_per_project")}
            className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-[#17324D] hover:bg-[#12273D] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#3E9C96]" />
            <span>{isId ? "Beli 1X Proyek (Rp 20k)" : "Buy 1X Pass ($1.30)"}</span>
          </button>

          <button
            type="button"
            onClick={() => openCheckout("pro_researcher")}
            className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-[#2F7D78] hover:bg-[#266662] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Crown className="w-3.5 h-3.5 text-yellow-300" />
            <span>{isId ? "Upgrade Pro ($29 / bln)" : "Upgrade Pro ($29/mo)"}</span>
          </button>
        </div>
      </div>

      <QrisCheckoutModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        planKey={selectedPlan}
        onSuccess={() => {
          setModalOpen(false);
          if (typeof window !== "undefined") {
            window.location.reload();
          }
        }}
      />
    </>
  );
}
