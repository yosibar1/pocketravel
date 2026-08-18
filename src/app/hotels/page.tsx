"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLang } from "@/components/LanguageProvider";
import { SearchBox } from "@/components/SearchBox";
import { HotelCard } from "@/components/Cards";
import { getDestination } from "@/lib/data/destinations";
import type { Hotel } from "@/lib/types";

type SortKey = "price" | "rating";

function nightsBetween(checkIn?: string | null, checkOut?: string | null): number {
  if (!checkIn || !checkOut) return 1;
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(Math.round(ms / 86400000), 1);
}

function HotelsResults() {
  const { t, lt } = useLang();
  const searchParams = useSearchParams();
  const [sort, setSort] = useState<SortKey>("rating");
  const [minStars, setMinStars] = useState(0);

  const destinationId = searchParams.get("destination");
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const nights = nightsBetween(checkIn, checkOut);
  const dest = destinationId ? getDestination(destinationId) : undefined;

  const [result, setResult] = useState<{ key: string; hotels: Hotel[] } | null>(null);

  useEffect(() => {
    if (!destinationId) return;
    let cancelled = false;
    fetch(`/api/hotels?destination=${destinationId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setResult({ key: destinationId, hotels: data.hotels ?? [] });
      });
    return () => {
      cancelled = true;
    };
  }, [destinationId]);

  const loading = Boolean(destinationId) && result?.key !== destinationId;

  const hotels = result?.key === destinationId ? result.hotels : [];
  const view = hotels
    .filter((h) => h.stars >= minStars)
    .sort((a, b) =>
      sort === "price" ? a.pricePerNightUSD - b.pricePerNightUSD : b.rating - a.rating
    );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex justify-center">
        <SearchBox initialTab="hotels" />
      </div>

      {destinationId && (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
              {t.sortBy}:
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
              >
                <option value="rating">{t.sortRating}</option>
                <option value="price">{t.sortPrice}</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
              {t.minStars}:
              <select
                value={minStars}
                onChange={(e) => setMinStars(Number(e.target.value))}
                className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
              >
                <option value={0}>{t.filterAll}</option>
                <option value={3}>3+</option>
                <option value={4}>4+</option>
                <option value={5}>5</option>
              </select>
            </label>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-500">...</div>
          ) : (
            <>
              <h2 className="mb-3 text-xl font-bold">
                🏨 {dest ? `${lt(dest.city)}, ${lt(dest.country)}` : destinationId} · {view.length}{" "}
                {t.results}
              </h2>
              <div className="flex flex-col gap-4">
                {view.length === 0 && (
                  <p className="py-8 text-center text-slate-500">{t.noResults}</p>
                )}
                {view.map((h) => (
                  <HotelCard key={h.id} hotel={h} nights={nights} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default function HotelsPage() {
  return (
    <Suspense>
      <HotelsResults />
    </Suspense>
  );
}
