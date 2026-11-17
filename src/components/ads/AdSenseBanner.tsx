"use client";

import React, { useEffect } from "react";
import { Sparkles, DollarSign } from "lucide-react";

interface AdSenseBannerProps {
  clientId?: string;
  slotId?: string;
  format?: "auto" | "horizontal" | "rectangle";
  className?: string;
}

export function AdSenseBanner({
  clientId = "ca-pub-ib-slr-academic",
  slotId = "1234567890",
  format = "horizontal",
  className = "",
}: AdSenseBannerProps) {
  const isRealClient = clientId && !clientId.includes("academic") && !clientId.includes("demo");

  useEffect(() => {
    if (isRealClient && typeof window !== "undefined") {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        // Suppress adsbygoogle push error if script blocked by AdBlocker
      }
    }
  }, [isRealClient]);

  return (
    <div className={`no-print w-full my-6 flex flex-col items-center justify-center ${className}`}>
      {/* Label indicating compliant sponsor slot */}
      <div className="w-full max-w-4xl flex items-center justify-between text-[10px] text-gray-400 mb-1 px-2">
        <span className="uppercase tracking-wider">Sponsor / Advertisements</span>
        <span className="hover:underline cursor-pointer">Ad Choices</span>
      </div>

      <div className="w-full max-w-4xl min-h-[90px] rounded-xl border border-dashed border-[#E4E7EC] bg-[#FFFFFF] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-xs">
        {isRealClient ? (
          <ins
            className="adsbygoogle"
            style={{ display: "block", width: "100%", height: "90px" }}
            data-ad-client={clientId}
            data-ad-slot={slotId}
            data-ad-format={format}
            data-full-width-responsive="true"
          />
        ) : (
          /* Preview / Academic AdSense Placeholder for instant visual confirmation */
          <>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#EFF7F6] text-[#2F7D78] flex items-center justify-center shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#17324D]">
                    Google AdSense Partner Placement
                  </span>
                  <span className="px-2 py-0.5 rounded text-[9px] bg-[#EFF7F6] text-[#2F7D78] font-bold uppercase tracking-wider">
                    Monetization Active
                  </span>
                </div>
                <p className="text-[11px] text-[#667085] mt-0.5 max-w-xl">
                  Ruang iklan ini otomatis menampilkan iklan kontekstual Google AdSense ({clientId}) untuk menambah pendapatan platform tanpa mengganggu alur review ilmiah.
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <span className="text-[10px] text-gray-400 font-mono">
                Slot: {slotId} (728x90)
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
