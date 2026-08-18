"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Lang, LocalizedText } from "@/lib/types";
import { getDict, type Dictionary } from "@/lib/i18n";

interface LanguageContextValue {
  lang: Lang;
  dir: "rtl" | "ltr";
  t: Dictionary;
  lt: (text: LocalizedText) => string;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("he");

  // Server HTML is always Hebrew; the saved preference is applied after
  // hydration to avoid a server/client markup mismatch.
  useEffect(() => {
    const saved = window.localStorage.getItem("pocketravel-lang");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved === "en" || saved === "he") setLang(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "he" ? "rtl" : "ltr";
    window.localStorage.setItem("pocketravel-lang", lang);
  }, [lang]);

  const value: LanguageContextValue = {
    lang,
    dir: lang === "he" ? "rtl" : "ltr",
    t: getDict(lang),
    lt: (text) => text[lang],
    toggleLang: () => setLang((l) => (l === "he" ? "en" : "he")),
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
  return ctx;
}
