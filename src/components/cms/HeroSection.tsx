"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { PageSection } from "../../lib/types/cms";
import { useLanguage } from "../i18n/LanguageContext";
import { heroTranslations } from "../../lib/i18n/cmsTranslations";

interface HeroSectionProps {
  section: PageSection;
}

export function HeroSection({ section }: HeroSectionProps) {
  const content = section.content || {};
  const { isId } = useLanguage();
  const dict = isId ? heroTranslations.id : heroTranslations.en;

  const title = isId ? dict.title : (section.title || dict.title);
  const subtitle = isId ? dict.subtitle : (section.subtitle || dict.subtitle);
  const badge = isId ? dict.badge : (content.badge || dict.badge);
  const primaryCta = isId ? dict.primaryCta : (content.primaryCtaText || dict.primaryCta);
  const secondaryCta = isId ? dict.secondaryCta : (content.secondaryCtaText || dict.secondaryCta);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FFFFFF] via-[#F7F8FA] to-[#F7F8FA] py-16 sm:py-24 border-b border-[#E4E7EC]">
      {/* Background academic grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#E4E7EC_1px,transparent_1px),linear-gradient(to_bottom,#E4E7EC_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Eyebrow Badge */}
        {badge && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EFF7F6] border border-[#2F7D78]/25 text-[#2F7D78] text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{badge}</span>
          </div>
        )}

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#17324D] leading-tight mb-6">
          {title}
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg lg:text-xl text-[#667085] leading-relaxed max-w-3xl mx-auto mb-10">
          {subtitle}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-10">
          <Link
            href={content.primaryCtaUrl || "/register"}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white bg-[#17324D] hover:bg-[#12273D] shadow-sm transition-all focus:ring-2 focus:ring-[#2F7D78] focus:ring-offset-2"
          >
            <span>{primaryCta}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href={content.secondaryCtaUrl || "/how-it-works"}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm font-semibold text-[#17212B] bg-[#FFFFFF] hover:bg-[#F7F8FA] border border-[#E4E7EC] shadow-sm transition-all"
          >
            {secondaryCta}
          </Link>
        </div>

        {/* Trust & Guarantee Markers */}
        <div className="pt-6 border-t border-[#E4E7EC]/80 flex flex-wrap items-center justify-center gap-6 text-xs text-[#667085]">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#18794E]" />
            <span>{dict.trustPrisma}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#18794E]" />
            <span>{dict.trustQuote}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#2F7D78]" />
            <span>{dict.trustRls}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
