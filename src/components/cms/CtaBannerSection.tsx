import React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { PageSection } from "../../lib/types/cms";

interface CtaBannerSectionProps {
  section: PageSection;
}

export function CtaBannerSection({ section }: CtaBannerSectionProps) {
  const content = section.content || {};

  return (
    <section className="py-16 sm:py-20 bg-[#17324D] text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="w-12 h-12 rounded-xl bg-[#244A70] text-[#3E9C96] flex items-center justify-center mx-auto mb-6">
          <BookOpen className="w-6 h-6" />
        </div>

        <h2 className="text-2xl sm:text-4xl font-bold tracking-tight mb-4">
          {section.title || "Advance Your Literature Review Today"}
        </h2>

        <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
          {section.subtitle ||
            "Join researchers worldwide in building transparent, reproducible systematic reviews with IB-SLR."}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          {content.primaryCtaText && (
            <Link
              href={content.primaryCtaUrl || "/register"}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-[#17324D] bg-white hover:bg-gray-100 shadow-sm transition-all"
            >
              <span>{content.primaryCtaText}</span>
              <ArrowRight className="w-4 h-4 text-[#2F7D78]" />
            </Link>
          )}

          {content.secondaryCtaText && (
            <Link
              href={content.secondaryCtaUrl || "/contact"}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm font-semibold text-white bg-[#244A70] hover:bg-[#2D5A86] border border-[#3E658E] transition-all"
            >
              {content.secondaryCtaText}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
