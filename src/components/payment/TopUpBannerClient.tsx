"use client";

import React, { useState } from "react";
import { PlusCircle, ArrowRight, Sparkles, QrCode } from "lucide-react";
import { QrisCheckoutModal } from "./QrisCheckoutModal";

interface Props {
  isId?: boolean;
}

export function TopUpBannerClient({ isId = true }: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="no-print my-6 p-4 rounded-xl bg-gradient-to-r from-[#EFF7F6] to-white border border-[#2F7D78]/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#2F7D78] text-white flex items-center justify-center shrink-0 shadow-sm">
            <QrCode className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-[#17324D]">
                Top-Up Pay-Per-Project Pass
              </h4>
              <span className="px-2 py-0.5 rounded text-[10px] bg-[#18794E] text-white font-semibold">
                {isId ? "Rp 20.000 / 1X Proyek Aktif" : "Rp 20,000 / 1X Active Project"}
              </span>
            </div>
            <p className="text-xs text-[#667085] mt-0.5">
              {isId
                ? "Paket Academic Free mencakup 1x proyek aktif gratis. Perlu proyek kedua? Cukup bayar Rp 20.000 via QRIS instan tanpa perlu langganan bulanan."
                : "Academic Free tier includes 1 free active project. Need an extra active project slot? Top up +1 Active Project for just Rp 20,000 (~$1.30) via instant QRIS."}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="shrink-0 px-3.5 py-2 rounded-lg bg-[#17324D] hover:bg-[#12273D] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#3E9C96]" />
          <span>{isId ? "Beli 1X Proyek (QRIS)" : "Buy 1X Project Pass"}</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#3E9C96]" />
        </button>
      </div>

      <QrisCheckoutModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          // Refresh page or trigger quota re-render
        }}
      />
    </>
  );
}
