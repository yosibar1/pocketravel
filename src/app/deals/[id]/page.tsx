"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useLang } from "@/components/LanguageProvider";
import { HotelCard, VisualBanner, Stars } from "@/components/Cards";
import { DealCard, formatDateRange } from "@/components/DealCard";
import { getDeal, getDateVariants, searchDeals } from "@/lib/data/deals";
import { getDestination } from "@/lib/data/destinations";
import { getHotel } from "@/lib/data/hotels";
import { formatPrice } from "@/lib/currency";
import type { TranslationKey } from "@/lib/i18n";

export default function DealPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t, lt, lang } = useLang();
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);

  const deal = getDeal(id);
  if (!deal) notFound();
  const dest = getDestination(deal.destinationId);
  const hotel = getHotel(deal.hotelId);
  if (!dest || !hotel) notFound();

  const locale = lang === "he" ? "he-IL" : "en-US";
  const variants = getDateVariants(deal);
  const selected =
    selectedVariant !== null
      ? variants[selectedVariant]
      : variants.find((v) => v.startDate === deal.startDate) ?? variants[0];

  const similar = searchDeals({ region: deal.destinationId })
    .filter((d) => d.id !== deal.id)
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="relative">
          <VisualBanner imageKey={dest.image} className="h-56" />
          <div className="absolute top-4 flex gap-2 ltr:left-4 rtl:right-4">
            {deal.isHot && (
              <span className="rounded-full bg-rose-600 px-3 py-1 text-sm font-bold text-white shadow">
                🔥 {t.hotDeal}
              </span>
            )}
            {deal.originalPriceUSD && (
              <span className="rounded-full bg-emerald-600 px-3 py-1 text-sm font-bold text-white shadow">
                ⬇ {t.priceDropped}
              </span>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-indigo-950">
                {lt(dest.city)}, {lt(dest.country)}
              </h1>
              <div className="mt-1 flex items-center gap-2 text-slate-600">
                <span>{lt(hotel.name)}</span>
                <Stars count={hotel.stars} />
              </div>
              <p className="mt-1 text-sm font-medium text-slate-500">
                {formatDateRange(selected.startDate, selected.endDate, locale)} · {deal.nights}{" "}
                {t.nights}
              </p>
            </div>
            <div className="text-end">
              {deal.originalPriceUSD && (
                <div className="text-slate-400 line-through">
                  {formatPrice(deal.originalPriceUSD, lang)}
                </div>
              )}
              <div className="text-4xl font-extrabold text-indigo-950">
                {formatPrice(selected.pricePerPersonUSD, lang)}
              </div>
              <div className="text-sm text-slate-500">{t.perPersonPackage}</div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-800">
              🍽 {t[`board_${deal.boardBasis}` as TranslationKey]}
            </span>
            <span className="rounded-full bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700">
              ✈️ {deal.directFlight ? t.directFlight : t.withStop}
            </span>
            {deal.luggageIncluded && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
                🧳 {t.luggageIncluded}
              </span>
            )}
          </div>

          <h2 className="mt-8 font-bold text-indigo-950">{t.priceCalendar}</h2>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
            {variants.map((v, i) => {
              const isSelected = v.startDate === selected.startDate;
              return (
                <button
                  key={v.startDate}
                  onClick={() => setSelectedVariant(i)}
                  className={`min-w-32 shrink-0 rounded-2xl border-2 p-3 text-center transition-colors ${
                    isSelected
                      ? "border-fuchsia-600 bg-fuchsia-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="text-xs font-medium text-slate-500">
                    {formatDateRange(v.startDate, v.endDate, locale)}
                  </div>
                  <div className="mt-1 text-lg font-extrabold text-indigo-950">
                    {formatPrice(v.pricePerPersonUSD, lang)}
                  </div>
                  {v.isCheapest && (
                    <div className="mt-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
                      {t.cheapest}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <h2 className="mt-6 font-bold text-indigo-950">{t.whatsInPackage}</h2>
          <ul className="mt-2 flex flex-col gap-1 text-sm text-slate-600">
            <li>
              ✓ {t.pk_flight} ({deal.directFlight ? t.directFlight : t.withStop})
            </li>
            <li>
              ✓ {t.pk_hotel} — {deal.nights} {t.nights},{" "}
              {t[`board_${deal.boardBasis}` as TranslationKey]}
            </li>
            {deal.luggageIncluded && <li>✓ {t.luggageIncluded}</li>}
            <li className="text-slate-400">• {t.pk_transfer_note}</li>
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => alert(t.bookDemoAlert)}
              className="rounded-full bg-gradient-to-l from-fuchsia-600 to-rose-500 px-8 py-3 font-bold text-white shadow-sm transition-transform hover:scale-105"
            >
              {t.book} · {formatPrice(selected.pricePerPersonUSD, lang)}
            </button>
            <Link
              href={`/planner?destination=${dest.id}&days=${deal.nights + 1}`}
              className="rounded-full border-2 border-indigo-950 px-6 py-3 font-bold text-indigo-950 transition-colors hover:bg-indigo-50"
            >
              🪄 {t.planTrip}
            </Link>
          </div>
          <p className="mt-4 text-xs text-amber-600">{t.demoDealNote}</p>
        </div>
      </div>

      <h2 className="mb-3 mt-8 text-xl font-bold text-indigo-950">{t.theHotel}</h2>
      <HotelCard hotel={hotel} nights={deal.nights} />

      <h2 className="mb-3 mt-8 text-xl font-bold text-indigo-950">{t.aboutDestination}</h2>
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <p className="text-slate-700">{lt(dest.description)}</p>
        <ul className="mt-3 grid grid-cols-1 gap-1 text-sm text-slate-600 sm:grid-cols-2">
          {dest.activities.map((a, i) => (
            <li key={i}>• {lt(a)}</li>
          ))}
        </ul>
      </div>

      {similar.length > 0 && (
        <>
          <h2 className="mb-3 mt-8 text-xl font-bold text-indigo-950">{t.similarDeals}</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((d) => (
              <DealCard key={d.id} deal={d} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
