"use client";

import { useLang } from "@/components/LanguageProvider";
import { PackageCard } from "@/components/Cards";
import { packages } from "@/lib/data/packages";

export default function PackagesPage() {
  const { t } = useLang();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-extrabold">{t.packagesTitle}</h1>
      <p className="mt-1 text-slate-600">{t.packagesSubtitle}</p>
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map((p) => (
          <PackageCard key={p.id} pack={p} />
        ))}
      </div>
    </div>
  );
}
