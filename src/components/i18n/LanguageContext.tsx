"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, translations, Translations } from "../../lib/i18n/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof Translations, fallback?: string) => string;
  isId: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key, fallback) => fallback || String(key),
  isId: false,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    // Read from localStorage or cookie
    try {
      const stored = localStorage.getItem("ib_slr_lang") as Language;
      if (stored === "id" || stored === "en") {
        setLanguageState(stored);
        document.documentElement.lang = stored;
        return;
      }
      const match = document.cookie.match(/ib_slr_lang=(id|en)/);
      if (match && (match[1] === "id" || match[1] === "en")) {
        setLanguageState(match[1] as Language);
        document.documentElement.lang = match[1];
      }
    } catch {
      // Fallback silently
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("ib_slr_lang", lang);
      document.cookie = `ib_slr_lang=${lang}; path=/; max-age=31536000`;
      document.documentElement.lang = lang;
    } catch {
      // Fallback
    }
  };

  const t = (key: keyof Translations, fallback?: string): string => {
    const dict = translations[language] || translations.id;
    return dict[key] || fallback || String(key);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isId: language === "id",
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
