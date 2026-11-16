"use client";

import React from "react";
import { PageSection } from "../../lib/types/cms";
import { useLanguage } from "../i18n/LanguageContext";

interface MetricsDisplaySectionProps {
  section: PageSection;
}

export function MetricsDisplaySection({ section }: MetricsDisplaySectionProps) {
  const content = section.content || {};
  const { isId } = useLanguage();

  const metrics: Array<{ label: string; value: string; description?: string }> =
    content.metrics || [];

  if (metrics.length === 0) return null;

  const translatedMetrics = metrics.map((m) => {
    if (!isId) return m;
    const l = m.label.toLowerCase();
    if (l.includes("reference")) {
      return {
        ...m,
        label: "Referensi Terverifikasi",
        description: "Diproses melalui deduplikasi otomatis dan screening ganda.",
      };
    }
    if (l.includes("prisma") || l.includes("accuracy") || l.includes("conformity")) {
      return {
        ...m,
        label: "Kepatuhan PRISMA 2020",
        description: "Buku besar aktivitas mencatat setiap inklusi & eksklusi secara deterministik.",
      };
    }
    if (l.includes("audit") || l.includes("grounding") || l.includes("citation")) {
      return {
        ...m,
        label: "Bukti Sitasi Nyata",
        description: "Setiap data ekstraksi AI berakar pada teks artikel dan nomor halaman asli.",
      };
    }
    return m;
  });

  return (
    <section className="py-14 bg-[#17324D] text-white border-b border-[#244A70]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-[#244A70]">
          {translatedMetrics.map((m, idx) => (
            <div key={idx} className="pt-6 md:pt-0 px-4">
              <div className="text-3xl sm:text-4xl font-bold tracking-tight text-[#3E9C96] mb-2">
                {m.value}
              </div>
              <div className="text-sm font-semibold text-gray-100 uppercase tracking-wider mb-1">
                {m.label}
              </div>
              {m.description && (
                <p className="text-xs text-gray-300 max-w-xs mx-auto leading-relaxed">
                  {m.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
