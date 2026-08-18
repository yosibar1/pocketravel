"use client";

import { useLang } from "./LanguageProvider";

export function Footer() {
  const { t } = useLang();
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 text-center text-sm text-slate-500">
        <p>{t.footerText}</p>
        <p className="mt-1 text-xs text-amber-600">{t.demoBanner}</p>
      </div>
    </footer>
  );
}
