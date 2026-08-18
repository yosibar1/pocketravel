"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useLang } from "@/components/LanguageProvider";
import { HotelCard, VisualBanner } from "@/components/Cards";
import { getPackage } from "@/lib/data/packages";
import { getDestination } from "@/lib/data/destinations";
import { getHotel } from "@/lib/data/hotels";
import type { TranslationKey } from "@/lib/i18n";

export default function PackageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t, lt } = useLang();
  const pack = getPackage(id);
  if (!pack) notFound();
  const dest = getDestination(pack.destinationId);
  const hotel = getHotel(pack.hotelId);
  if (!dest) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
        <VisualBanner imageKey={dest.image} className="h-56" />
        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold">{lt(pack.title)}</h1>
              <p className="mt-1 text-slate-600">
                {lt(dest.city)}, {lt(dest.country)} · {pack.nights} {t.nights}
              </p>
            </div>
            <div className="text-end">
              <div className="text-3xl font-extrabold text-sky-600">
                ${pack.pricePerPersonUSD}
              </div>
              <div className="text-sm text-slate-500">{t.perPerson}</div>
            </div>
          </div>

          <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            ✨ {lt(pack.highlight)}
          </p>

          <h2 className="mt-6 font-bold">{t.includes}</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {pack.includes.map((inc) => (
              <span
                key={inc}
                className="rounded-full bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700"
              >
                ✓ {t[`inc_${inc}` as TranslationKey] ?? inc}
              </span>
            ))}
          </div>

          <h2 className="mt-6 font-bold">{t.whatToDo}</h2>
          <ul className="mt-2 grid grid-cols-1 gap-1 text-sm text-slate-600 sm:grid-cols-2">
            {dest.activities.map((a, i) => (
              <li key={i}>• {lt(a)}</li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => alert(t.bookDemoAlert)}
              className="rounded-full bg-sky-600 px-6 py-3 font-bold text-white transition-colors hover:bg-sky-700"
            >
              {t.book}
            </button>
            <Link
              href={`/planner?destination=${dest.id}&days=${pack.nights + 1}`}
              className="rounded-full border border-sky-600 px-6 py-3 font-bold text-sky-600 transition-colors hover:bg-sky-50"
            >
              🪄 {t.planTrip}
            </Link>
          </div>
        </div>
      </div>

      {hotel && (
        <div className="mt-6">
          <HotelCard hotel={hotel} nights={pack.nights} />
        </div>
      )}
    </div>
  );
}
