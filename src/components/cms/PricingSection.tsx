import React from "react";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { PageSection, PricingPlan } from "../../lib/types/cms";

interface PricingSectionProps {
  section: PageSection;
  plans?: PricingPlan[];
}

export function PricingSection({ section, plans = [] }: PricingSectionProps) {
  if (plans.length === 0) return null;

  return (
    <section className="py-16 sm:py-24 bg-[#F7F8FA] border-b border-[#E4E7EC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#17324D] mb-4">
            {section.title || "Transparent, Academic-Friendly Pricing"}
          </h2>
          {section.subtitle && (
            <p className="text-base text-[#667085] leading-relaxed">
              {section.subtitle}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-xl p-8 flex flex-col justify-between transition-all relative ${
                plan.isFeatured
                  ? "bg-[#FFFFFF] border-2 border-[#2F7D78] shadow-md ring-1 ring-[#2F7D78]"
                  : "bg-[#FFFFFF] border border-[#E4E7EC] shadow-sm"
              }`}
            >
              <div>
                {plan.isFeatured && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#2F7D78] text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                    Most Popular for Funded Reviews
                  </span>
                )}

                <h3 className="text-lg font-bold text-[#17324D] mb-1">{plan.name}</h3>
                <p className="text-xs text-[#667085] mb-6 min-h-[32px]">{plan.tagline}</p>

                <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-[#E4E7EC]">
                  <span className="text-4xl font-extrabold tracking-tight text-[#17324D]">
                    ${plan.priceMonthly}
                  </span>
                  <span className="text-xs text-[#667085] font-medium">/ month</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-[#17212B]">
                      <Check className="w-4 h-4 text-[#18794E] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <Link
                  href={plan.priceMonthly === 0 ? "/register" : "/register"}
                  className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    plan.isFeatured
                      ? "bg-[#2F7D78] hover:bg-[#266662] text-white"
                      : "bg-[#17324D] hover:bg-[#12273D] text-white"
                  }`}
                >
                  <span>{plan.priceMonthly === 0 ? "Get Started Free" : "Subscribe to Plan"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
