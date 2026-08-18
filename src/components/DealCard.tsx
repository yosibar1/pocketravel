"use client";

import Link from "next/link";
import { useLang } from "./LanguageProvider";
import { VisualBanner, Stars } from "./Cards";
import { formatPrice } from "@/lib/currency";
import { getDestination } from "@/lib/data/destinations";
import { getHotel } from "@/lib/data/hotels";
import type { Deal } from "@/lib/types";
import type { TranslationKey } from "@/lib/i18n";

export function formatDateRange(start: string, end: string, locale: string): string {
  const fmt = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" });
  return `${fmt.format(new Date(start + "T00:00:00Z"))} – ${fmt.format(new Date(end + "T00:00:00Z"))}`;
}

export function DealCard({ deal }: { deal: Deal }) {
  const { t, lt, lang } = useLang();
  const dest = getDestination(deal.destinationId);
  const hotel = getHotel(deal.hotelId);
  if (!dest || !hotel) return null;
  const locale = lang === "he" ? "he-IL" : "en-US";

  return (
    <Link
      href={`/deals/${deal.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition-all hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative">
        <VisualBanner imageKey={dest.image} className="h-40" />
        <div className="absolute top-3 flex gap-1.5 ltr:left-3 rtl:right-3">
          {deal.isHot && (
            <span className="rounded-full bg-rose-600 px-2.5 py-1 text-xs font-bold text-white shadow">
              🔥 {t.hotDeal}
            </span>
          )}
          {deal.originalPriceUSD && (
            <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow">
              ⬇ {t.priceDropped}
            </span>
          )}
        </div>
        <span className="absolute bottom-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-indigo-950 shadow ltr:right-3 rtl:left-3">
          {deal.nights} {t.nights}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-lg font-bold text-indigo-950">
            {lt(dest.city)}, {lt(dest.country)}
          </h3>
          <span className="whitespace-nowrap text-sm font-medium text-slate-500">
            {formatDateRange(deal.startDate, deal.endDate, locale)}
          </span>
        </div>

        <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
          <span className="truncate">{lt(hotel.name)}</span>
          <Stars count={hotel.stars} />
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-800">
            {t[`board_${deal.boardBasis}` as TranslationKey]}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              deal.directFlight ? "bg-sky-50 text-sky-700" : "bg-slate-100 text-slate-600"
            }`}
          >
            ✈️ {deal.directFlight ? t.directFlight : t.withStop}
          </span>
          {deal.luggageIncluded && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              🧳 {t.luggageIncluded}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            {deal.originalPriceUSD && (
              <div className="text-sm text-slate-400 line-through">
                {formatPrice(deal.originalPriceUSD, lang)}
              </div>
            )}
            <div className="text-2xl font-extrabold text-indigo-950">
              {formatPrice(deal.pricePerPersonUSD, lang)}
            </div>
            <div className="text-xs text-slate-500">{t.perPersonPackage}</div>
          </div>
          <span className="rounded-full bg-gradient-to-l from-fuchsia-600 to-rose-500 px-5 py-2 text-sm font-bold text-white shadow-sm transition-transform group-hover:scale-105">
            {t.toDeal}
          </span>
        </div>
      </div>
    </Link>
  );
}
