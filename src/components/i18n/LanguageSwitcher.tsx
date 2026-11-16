"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "./LanguageContext";
import { Globe, ChevronDown, Check } from "lucide-react";

interface Props {
  variant?: "header" | "footer" | "compact";
}

export function LanguageSwitcher({ variant = "header" }: Props) {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const languages = [
    { code: "id" as const, label: "Bahasa Indonesia", short: "ID", flag: "🇮🇩" },
    { code: "en" as const, label: "English", short: "EN", flag: "🇬🇧" },
  ];

  const current = languages.find((l) => l.code === language) || languages[0];

  if (variant === "compact") {
    return (
      <div className="inline-flex rounded-lg border border-[#E4E7EC] bg-white p-0.5 text-xs shadow-sm">
        {languages.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => setLanguage(l.code)}
            className={`px-2 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
              language === l.code
                ? "bg-[#17324D] text-white font-semibold"
                : "text-[#667085] hover:text-[#17212B]"
            }`}
          >
            <span>{l.flag}</span>
            <span>{l.short}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
          variant === "footer"
            ? "border-gray-700 bg-gray-900 text-gray-300 hover:text-white hover:border-gray-600"
            : "border-[#E4E7EC] bg-white text-[#17324D] hover:bg-[#F7F8FA] hover:border-[#2F7D78]/30 shadow-sm"
        }`}
        aria-haspopup="true"
        aria-expanded={isOpen}
        title={t("lang_switch", "Pilih Bahasa")}
      >
        <Globe className="w-3.5 h-3.5 text-[#2F7D78]" />
        <span>{current.flag}</span>
        <span className="font-semibold">{current.short}</span>
        <ChevronDown className={`w-3 h-3 text-[#667085] transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 z-50 mt-1.5 w-44 rounded-xl border border-[#E4E7EC] bg-white p-1 shadow-lg ring-1 ring-black/5 animate-in fade-in-50 zoom-in-95 duration-100 ${
            variant === "footer" ? "bottom-full mb-1.5 mt-0" : ""
          }`}
        >
          <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#667085]">
            {t("lang_switch", "Pilih Bahasa")}
          </div>
          {languages.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => {
                setLanguage(l.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors text-left ${
                language === l.code
                  ? "bg-[#EFF7F6] text-[#17324D] font-bold"
                  : "text-[#17212B] hover:bg-[#F7F8FA]"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{l.flag}</span>
                <span>{l.label}</span>
              </div>
              {language === l.code && <Check className="w-3.5 h-3.5 text-[#2F7D78]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
