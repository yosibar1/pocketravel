"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLang } from "@/components/LanguageProvider";
import { SearchBox } from "@/components/SearchBox";
import { FlightCard } from "@/components/Cards";
import type { Flight } from "@/lib/types";

type SortKey = "price" | "duration" | "depart";

function applyFilters(flights: Flight[], sortKey: SortKey, direct: boolean, max: number) {
  let out = flights.filter((f) => f.priceUSD <= max);
  if (direct) out = out.filter((f) => f.stops === 0);
  return [...out].sort((a, b) => {
    if (sortKey === "price") return a.priceUSD - b.priceUSD;
    if (sortKey === "duration") return a.durationMinutes - b.durationMinutes;
    return a.departTime.localeCompare(b.departTime);
  });
}

function FlightsResults() {
  const { t } = useLang();
  const searchParams = useSearchParams();
  const [sort, setSort] = useState<SortKey>("price");
  const [directOnly, setDirectOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(2000);

  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const date = searchParams.get("date");
  const returnDate = searchParams.get("returnDate");
  const searchKey = `${from}|${to}|${date}|${returnDate}`;

  const [result, setResult] = useState<{
    key: string;
    outbound: Flight[];
    inbound: Flight[];
  } | null>(null);

  useEffect(() => {
    if (!to) return;
    let cancelled = false;
    const params = new URLSearchParams({ from: from ?? "TLV", to, date: date ?? "" });
    if (returnDate) params.set("returnDate", returnDate);
    fetch(`/api/flights?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setResult({ key: searchKey, outbound: data.outbound ?? [], inbound: data.inbound ?? [] });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [from, to, date, returnDate, searchKey]);

  const loading = Boolean(to) && result?.key !== searchKey;

  const outboundView = useMemo(
    () => applyFilters(result?.key === searchKey ? result.outbound : [], sort, directOnly, maxPrice),
    [result, searchKey, sort, directOnly, maxPrice]
  );
  const inboundView = useMemo(
    () => applyFilters(result?.key === searchKey ? result.inbound : [], sort, directOnly, maxPrice),
    [result, searchKey, sort, directOnly, maxPrice]
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex justify-center">
        <SearchBox initialTab="flights" />
      </div>

      {to && (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
              {t.sortBy}:
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
              >
                <option value="price">{t.sortPrice}</option>
                <option value="duration">{t.sortDuration}</option>
                <option value="depart">{t.sortDepart}</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <input
                type="checkbox"
                checked={directOnly}
                onChange={(e) => setDirectOnly(e.target.checked)}
                className="h-4 w-4 accent-sky-600"
              />
              {t.directOnly}
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
              {t.maxPrice}: ${maxPrice}
              <input
                type="range"
                min={100}
                max={2000}
                step={50}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="accent-sky-600"
              />
            </label>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-500">...</div>
          ) : (
            <>
              <h2 className="mb-3 text-xl font-bold">
                ✈️ {from} → {to} · {date}
              </h2>
              <div className="flex flex-col gap-3">
                {outboundView.length === 0 && (
                  <p className="py-8 text-center text-slate-500">{t.noResults}</p>
                )}
                {outboundView.map((f) => (
                  <FlightCard key={f.id} flight={f} onSelect={() => alert(t.bookDemoAlert)} />
                ))}
              </div>

              {inboundView.length > 0 && (
                <>
                  <h2 className="mb-3 mt-10 text-xl font-bold">
                    ✈️ {to} → {from} · {returnDate}
                  </h2>
                  <div className="flex flex-col gap-3">
                    {inboundView.map((f) => (
                      <FlightCard key={f.id} flight={f} onSelect={() => alert(t.bookDemoAlert)} />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default function FlightsPage() {
  return (
    <Suspense>
      <FlightsResults />
    </Suspense>
  );
}
