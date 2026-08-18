"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useLang } from "@/components/LanguageProvider";
import { VisualBanner } from "@/components/Cards";
import { getDestination } from "@/lib/data/destinations";
import type { TranslationKey } from "@/lib/i18n";

function plusDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function DestinationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t, lt } = useLang();
  const dest = getDestination(id);
  if (!dest) notFound();

  const flightParams = new URLSearchParams({
    from: "TLV",
    to: dest.airportCode,
    date: plusDays(14),
    returnDate: plusDays(19),
    passengers: "2",
  });
  const hotelParams = new URLSearchParams({
    destination: dest.id,
    checkIn: plusDays(14),
    checkOut: plusDays(19),
    guests: "2",
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
        <VisualBanner imageKey={dest.image} className="h-56" />
        <div className="p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h1 className="text-3xl font-extrabold">
              {lt(dest.city)}, {lt(dest.country)}
            </h1>
            <span className="font-semibold text-sky-600">
              {t.fromPrice}${dest.avgFlightPriceUSD}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {dest.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700"
              >
                {t[`tag_${tag}` as TranslationKey] ?? tag}
              </span>
            ))}
          </div>
          <p className="mt-4 text-slate-700">{lt(dest.description)}</p>

          <h2 className="mt-6 font-bold">{t.whatToDo}</h2>
          <ul className="mt-2 grid grid-cols-1 gap-1 text-sm text-slate-600 sm:grid-cols-2">
            {dest.activities.map((a, i) => (
              <li key={i}>• {lt(a)}</li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/flights?${flightParams}`}
              className="rounded-full bg-sky-600 px-6 py-3 font-bold text-white transition-colors hover:bg-sky-700"
            >
              ✈️ {t.seeFlights}
            </Link>
            <Link
              href={`/hotels?${hotelParams}`}
              className="rounded-full border border-sky-600 px-6 py-3 font-bold text-sky-600 transition-colors hover:bg-sky-50"
            >
              🏨 {t.seeHotels}
            </Link>
            <Link
              href={`/planner?destination=${dest.id}`}
              className="rounded-full border border-slate-300 px-6 py-3 font-bold text-slate-700 transition-colors hover:bg-slate-50"
            >
              🪄 {t.planTrip}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
