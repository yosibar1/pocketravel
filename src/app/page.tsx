"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";
import { SearchBox } from "@/components/SearchBox";
import { DestinationCard, PackageCard } from "@/components/Cards";
import { destinations } from "@/lib/data/destinations";
import { packages } from "@/lib/data/packages";

export default function HomePage() {
  const { t } = useLang();
  const featured = destinations.slice(0, 8);
  const featuredPackages = packages.slice(0, 6);

  return (
    <div>
      <section className="bg-gradient-to-b from-sky-600 via-sky-500 to-sky-50 pb-10 pt-16">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-4 text-center">
          <h1 className="text-4xl font-extrabold text-white drop-shadow-sm sm:text-5xl">
            {t.tagline}
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-sky-50">{t.heroSubtitle}</p>
          <div className="mt-4 flex gap-3">
            <Link
              href="/planner"
              className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-sky-700 shadow transition-transform hover:scale-105"
            >
              🪄 {t.heroCtaPlan}
            </Link>
            <Link
              href="/packages"
              className="rounded-full bg-sky-700/40 px-5 py-2.5 text-sm font-bold text-white ring-1 ring-white/40 transition-transform hover:scale-105"
            >
              🌍 {t.heroCtaExplore}
            </Link>
          </div>
          <div className="mt-8 w-full">
            <div className="flex justify-center">
              <Suspense>
                <SearchBox />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-6 text-2xl font-bold">{t.popularDestinations}</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((d) => (
            <DestinationCard key={d.id} dest={d} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-4">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">{t.featuredPackages}</h2>
          <Link href="/packages" className="text-sm font-semibold text-sky-600 hover:underline">
            {t.viewAll}
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featuredPackages.map((p) => (
            <PackageCard key={p.id} pack={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
