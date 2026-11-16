"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { PageSection, FAQItem } from "../../lib/types/cms";

interface FAQSectionProps {
  section: PageSection;
  faqs?: FAQItem[];
}

export function FAQSection({ section, faqs = [] }: FAQSectionProps) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id || null);

  if (faqs.length === 0) return null;

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="py-16 sm:py-24 bg-[#FFFFFF] border-b border-[#E4E7EC]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFF7F6] text-[#2F7D78] text-xs font-semibold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Methodology & Questions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#17324D] mb-4">
            {section.title || "Frequently Asked Questions"}
          </h2>
          {section.subtitle && (
            <p className="text-base text-[#667085] leading-relaxed">
              {section.subtitle}
            </p>
          )}
        </div>

        <div className="space-y-3">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="border border-[#E4E7EC] rounded-xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggle(faq.id)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 bg-[#FFFFFF] hover:bg-[#F7F8FA] transition-colors focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-semibold text-[#17212B]">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#667085] shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-[#2F7D78]" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-4 pt-1 bg-[#FFFFFF] border-t border-[#E4E7EC]/40">
                    <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
