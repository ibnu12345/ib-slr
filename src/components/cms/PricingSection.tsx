"use client";

import React from "react";
import Link from "next/link";
import { Check, ArrowRight, Sparkles, Zap, ShieldCheck } from "lucide-react";
import { PageSection, PricingPlan } from "../../lib/types/cms";
import { useLanguage } from "../i18n/LanguageContext";

interface PricingSectionProps {
  section: PageSection;
  plans?: PricingPlan[];
}

export function PricingSection({ section, plans = [] }: PricingSectionProps) {
  const { t, isId } = useLanguage();

  if (plans.length === 0) return null;

  return (
    <section className="py-16 sm:py-24 bg-[#F7F8FA] border-b border-[#E4E7EC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFF7F6] border border-[#2F7D78]/20 text-[#2F7D78] text-xs font-semibold uppercase tracking-wider mb-3">
            <Zap className="w-3.5 h-3.5" />
            <span>{isId ? "Pilihan Paket & Top-Up Fleksibel" : "Flexible Plans & Add-Ons"}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#17324D] mb-3">
            {isId ? "Biaya Transparan & Ramah Peneliti" : section.title || "Transparent, Academic-Friendly Pricing"}
          </h2>
          <p className="text-sm sm:text-base text-[#667085] leading-relaxed max-w-2xl mx-auto">
            {isId
              ? "Gratis 1 proyek aktif permanen untuk riset mandiri. Butuh proyek tambahan? Cukup Rp 20.000 per 1x proyek aktif tanpa harus langganan bulanan."
              : section.subtitle || "Start with 1 free active review project. Need more? Add 1x active review project for just Rp 20,000 without monthly commitments."}
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {plans.map((plan) => {
            const isPayPerProject = plan.tierKey === "pay_per_project" || plan.id === "plan-pay-per-project";
            const isFree = plan.priceMonthly === 0;

            let displayPrice = `$${plan.priceMonthly}`;
            let displayPeriod = plan.billingPeriodLabel || (isId ? "/ bulan" : "/ month");

            if (isId) {
              if (isFree) {
                displayPrice = "Gratis";
                displayPeriod = "selamanya";
              } else if (isPayPerProject) {
                displayPrice = "Rp 20.000";
                displayPeriod = "/ 1x proyek aktif";
              } else if (plan.priceIdr) {
                displayPrice = plan.priceIdr;
              }
            } else {
              if (isFree) {
                displayPrice = "Free";
                displayPeriod = "forever";
              } else if (isPayPerProject) {
                displayPrice = "Rp 20k";
                displayPeriod = "($1.30) / project";
              }
            }

            return (
              <div
                key={plan.id}
                className={`rounded-2xl p-6 flex flex-col justify-between transition-all relative ${
                  plan.isFeatured
                    ? "bg-[#FFFFFF] border-2 border-[#2F7D78] shadow-md ring-1 ring-[#2F7D78]"
                    : isPayPerProject
                    ? "bg-[#FFFFFF] border-2 border-[#17324D]/40 shadow-sm hover:border-[#17324D]"
                    : "bg-[#FFFFFF] border border-[#E4E7EC] shadow-sm hover:border-gray-300"
                }`}
              >
                <div>
                  {plan.isFeatured && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#2F7D78] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-sm whitespace-nowrap">
                      {isId ? "Paling Populer Hibah Riset" : "Most Popular for Grants"}
                    </span>
                  )}
                  {isPayPerProject && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#17324D] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-sm whitespace-nowrap">
                      {isId ? "Top-Up Fleksibel" : "Pay-Per-Project Pass"}
                    </span>
                  )}

                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-base font-bold text-[#17324D]">{plan.name}</h3>
                  </div>
                  <p className="text-xs text-[#667085] mb-5 min-h-[34px] leading-relaxed">
                    {plan.tagline}
                  </p>

                  <div className="flex items-baseline gap-1.5 mb-5 pb-5 border-b border-[#E4E7EC]">
                    <span className="text-3xl font-extrabold tracking-tight text-[#17324D]">
                      {displayPrice}
                    </span>
                    <span className="text-xs text-[#667085] font-medium">{displayPeriod}</span>
                  </div>

                  <ul className="space-y-2.5 mb-6">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-[#17212B]">
                        <Check className="w-3.5 h-3.5 text-[#18794E] shrink-0 mt-0.5" />
                        <span className="leading-tight">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2">
                  <Link
                    href="/register"
                    className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm ${
                      plan.isFeatured
                        ? "bg-[#2F7D78] hover:bg-[#266662] text-white"
                        : isPayPerProject
                        ? "bg-[#17324D] hover:bg-[#12273D] text-white"
                        : "bg-[#F7F8FA] hover:bg-[#E4E7EC] text-[#17324D] border border-[#E4E7EC]"
                    }`}
                  >
                    <span>
                      {isFree
                        ? isId ? "Mulai Gratis" : "Get Started Free"
                        : isPayPerProject
                        ? isId ? "Beli 1X Proyek (Rp 20k)" : "Get +1 Project Pass"
                        : isId ? "Pilih Paket" : "Subscribe to Plan"}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Highlight Callout: Pay-Per-Project Pass (Rp 20.000 / 1X Proyek Tambahan) */}
        <div className="mt-12 max-w-4xl mx-auto p-6 rounded-2xl bg-gradient-to-r from-[#EFF7F6] via-[#FFFFFF] to-[#EFF7F6] border border-[#2F7D78]/30 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-xl bg-[#2F7D78] text-white shrink-0 shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-[#17324D]">
                  {isId
                    ? "Butuh Tambahan 1X Proyek Tanpa Berlangganan Bulanan?"
                    : "Need an Extra 1X Project Without Monthly Commitments?"}
                </h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#18794E] text-white">
                  Rp 20.000
                </span>
              </div>
              <p className="text-xs text-[#667085] mt-1 max-w-2xl leading-relaxed">
                {isId
                  ? "Setiap pengguna baru langsung mendapatkan 1 Active Systematic Review Project secara gratis. Setelah kuota gratis digunakan, Anda bisa menambah 1x proyek aktif kapan saja hanya seharga Rp 20.000 per proyek tanpa perlu berlangganan paket bulanan."
                  : "Every new user gets 1 Active Systematic Review Project free forever. Once your free project slot is in use, you can unlock an additional active review project at any time for just Rp 20,000 (~$1.30) per project."}
              </p>
            </div>
          </div>
          <Link
            href="/register"
            className="shrink-0 px-4 py-2.5 rounded-lg bg-[#2F7D78] hover:bg-[#266662] text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <span>{isId ? "Daftar & Klaim Gratis" : "Start 1st Project Free"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
