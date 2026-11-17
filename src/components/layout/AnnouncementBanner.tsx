"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X, ArrowRight } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

interface AnnouncementBannerProps {
  announcement?: {
    isActive: boolean;
    message: string;
    linkUrl?: string;
    linkText?: string;
  };
}

export function AnnouncementBanner({ announcement }: AnnouncementBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const { isId } = useLanguage();

  if (!announcement || !announcement.isActive || isDismissed) {
    return null;
  }

  const message = isId
    ? "Beta Publik: IB-SLR 2.0 aktif dengan rekonsiliasi PRISMA 2020 dan opsi Pay-Per-Project Pass Rp 20.000."
    : announcement.message;

  const linkText = isId ? "Pelajari lebih lanjut" : announcement.linkText || "Learn more";

  return (
    <aside aria-label="Announcement" className="bg-[#17324D] text-white px-4 py-2 text-xs sm:text-sm font-medium border-b border-[#244A70] relative transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center justify-center gap-2 text-center flex-wrap">
          <span className="bg-[#2F7D78] text-[11px] font-semibold uppercase px-2 py-0.5 rounded tracking-wide">
            {isId ? "Pembaruan" : "Update"}
          </span>
          <span className="text-gray-100">{message}</span>
          {announcement.linkUrl && (
            <Link
              href={announcement.linkUrl}
              className="inline-flex items-center gap-1 text-[#3E9C96] hover:text-[#56B5AF] underline font-medium ml-1"
            >
              {linkText}
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="text-gray-400 hover:text-white p-1 rounded transition-colors focus:ring-1 focus:ring-white"
          aria-label="Dismiss announcement banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
