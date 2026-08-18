"use client";

import Link from "next/link";
import { useLang } from "./LanguageProvider";
import { getVisual } from "@/lib/visuals";
import type { Destination, Flight, Hotel, VacationPackage } from "@/lib/types";
import { getDestination } from "@/lib/data/destinations";
import { getHotel } from "@/lib/data/hotels";
import type { TranslationKey } from "@/lib/i18n";

export function VisualBanner({
  imageKey,
  className = "h-40",
}: {
  imageKey: string;
  className?: string;
}) {
  const v = getVisual(imageKey);
  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br ${v.gradient} ${className}`}
    >
      <span className="text-5xl drop-shadow-lg" aria-hidden>
        {v.emoji}
      </span>
    </div>
  );
}

export function Stars({ count }: { count: number }) {
  return (
    <span className="text-amber-400" aria-label={`${count} stars`}>
      {"★".repeat(count)}
    </span>
  );
}

export function DestinationCard({ dest }: { dest: Destination }) {
  const { t, lt } = useLang();
  return (
    <Link
      href={`/destinations/${dest.id}`}
      className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition-shadow hover:shadow-lg"
    >
      <VisualBanner imageKey={dest.image} />
      <div className="p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-lg font-bold">{lt(dest.city)}</h3>
          <span className="text-sm text-slate-500">{lt(dest.country)}</span>
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-slate-600">{lt(dest.description)}</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            {dest.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700"
              >
                {t[`tag_${tag}` as TranslationKey] ?? tag}
              </span>
            ))}
          </div>
          <span className="text-sm font-semibold text-sky-600">
            {t.fromPrice}${dest.avgFlightPriceUSD}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function FlightCard({ flight, onSelect }: { flight: Flight; onSelect?: () => void }) {
  const { t, lt } = useLang();
  const h = Math.floor(flight.durationMinutes / 60);
  const m = flight.durationMinutes % 60;
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-center">
      <div className="flex min-w-24 items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-700">
          {flight.airlineCode}
        </div>
        <span className="text-sm font-medium text-slate-700">{lt(flight.airline)}</span>
      </div>

      <div className="flex flex-1 items-center justify-center gap-4">
        <div className="text-center">
          <div className="text-xl font-bold">{flight.departTime}</div>
          <div className="text-xs text-slate-500">{flight.from}</div>
        </div>
        <div className="flex flex-col items-center px-2 text-center">
          <span className="text-xs text-slate-500">
            {h}:{String(m).padStart(2, "0")}
          </span>
          <div className="my-1 h-px w-20 bg-slate-300 sm:w-28" />
          <span className="text-xs font-medium text-slate-500">
            {flight.stops === 0
              ? t.direct
              : flight.stops === 1
                ? `${t.oneStop}${flight.stopCity ? ` · ${t.via} ${lt(flight.stopCity)}` : ""}`
                : `${flight.stops} ${t.stops}`}
          </span>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold">{flight.arriveTime}</div>
          <div className="text-xs text-slate-500">{flight.to}</div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
        <div className="text-2xl font-extrabold text-slate-900">${flight.priceUSD}</div>
        <button
          onClick={onSelect}
          className="rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-700"
        >
          {t.select}
        </button>
      </div>
    </div>
  );
}

export function HotelCard({ hotel, nights = 1 }: { hotel: Hotel; nights?: number }) {
  const { t, lt } = useLang();
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 sm:flex-row">
      <VisualBanner imageKey={hotel.image} className="h-36 sm:h-auto sm:w-48 sm:shrink-0" />
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold">{lt(hotel.name)}</h3>
            <Stars count={hotel.stars} />
          </div>
          <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
            <span className="rounded-md bg-sky-600 px-1.5 py-0.5 text-xs font-bold text-white">
              {hotel.rating}
            </span>
            <span>
              {hotel.reviewCount.toLocaleString()} {t.reviews}
            </span>
            <span>·</span>
            <span>
              {hotel.distanceFromCenterKm} {t.kmFromCenter}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {hotel.amenities.map((a) => (
              <span
                key={a}
                className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
              >
                {t[`am_${a}` as TranslationKey] ?? a}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <span className="text-xl font-extrabold">${hotel.pricePerNightUSD}</span>
            <span className="text-sm text-slate-500"> {t.perNight}</span>
            {nights > 1 && (
              <div className="text-xs text-slate-500">
                {t.total}: ${hotel.pricePerNightUSD * nights} · {nights} {t.nights}
              </div>
            )}
          </div>
          <button
            onClick={() => alert(t.bookDemoAlert)}
            className="rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-700"
          >
            {t.book}
          </button>
        </div>
      </div>
    </div>
  );
}

export function PackageCard({ pack }: { pack: VacationPackage }) {
  const { t, lt } = useLang();
  const dest = getDestination(pack.destinationId);
  const hotel = getHotel(pack.hotelId);
  if (!dest) return null;
  return (
    <Link
      href={`/packages/${pack.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition-shadow hover:shadow-lg"
    >
      <div className="relative">
        <VisualBanner imageKey={dest.image} />
        <span className="absolute top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-sky-700 ltr:left-3 rtl:right-3">
          {pack.nights} {t.nights}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-lg font-bold">{lt(pack.title)}</h3>
        <p className="text-sm text-slate-500">
          {lt(dest.city)}, {lt(dest.country)}
          {hotel ? ` · ${"★".repeat(hotel.stars)}` : ""}
        </p>
        <p className="mt-2 text-sm font-medium text-emerald-700">✨ {lt(pack.highlight)}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {pack.includes.map((inc) => (
            <span key={inc} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
              {t[`inc_${inc}` as TranslationKey] ?? inc}
            </span>
          ))}
        </div>
        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            <span className="text-2xl font-extrabold">${pack.pricePerPersonUSD}</span>
            <span className="text-sm text-slate-500"> {t.perPerson}</span>
          </div>
          <span className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition-colors group-hover:bg-sky-700">
            {t.select}
          </span>
        </div>
      </div>
    </Link>
  );
}
