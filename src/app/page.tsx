"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";
import { DealCard } from "@/components/DealCard";
import { destinations } from "@/lib/data/destinations";
import type { Deal } from "@/lib/types";
import type { TranslationKey } from "@/lib/i18n";

const REGIONS = ["all", "europe", "mediterranean", "fareast", "exotic"];
const NIGHTS = ["any", "short", "week", "long"];
const TYPES = ["any", "beach", "city", "romantic", "family", "ski", "food"];
const BOARDS = ["any", "AI", "HB", "BB", "RO"];

function upcomingMonthKeys(count: number): string[] {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
        active
          ? "bg-indigo-950 text-white shadow-sm"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

export default function HomePage() {
  const { t, lt, lang } = useLang();
  const locale = lang === "he" ? "he-IL" : "en-US";

  const [region, setRegion] = useState("all");
  const [month, setMonth] = useState("any");
  const [nights, setNights] = useState("any");
  const [type, setType] = useState("any");
  const [board, setBoard] = useState("any");
  const [directOnly, setDirectOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(3000);
  const [showMore, setShowMore] = useState(false);
  const [sort, setSort] = useState<"price" | "date" | "score">("score");

  const months = useMemo(() => upcomingMonthKeys(4), []);
  const monthLabel = (key: string) => {
    const [y, m] = key.split("-").map(Number);
    return new Intl.DateTimeFormat(locale, { month: "long" }).format(new Date(y, m - 1, 1));
  };

  const query = useMemo(() => {
    const p = new URLSearchParams({ region, month, nights, type, board });
    if (directOnly) p.set("direct", "1");
    if (maxPrice < 3000) p.set("maxPrice", String(maxPrice));
    return p.toString();
  }, [region, month, nights, type, board, directOnly, maxPrice]);

  const [result, setResult] = useState<{ key: string; deals: Deal[] } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/deals?${query}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setResult({ key: query, deals: data.deals ?? [] });
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  const loading = result?.key !== query;
  const deals = useMemo(() => {
    const list = result?.key === query ? [...result.deals] : [];
    if (sort === "price") list.sort((a, b) => a.pricePerPersonUSD - b.pricePerPersonUSD);
    else if (sort === "date") list.sort((a, b) => a.startDate.localeCompare(b.startDate));
    else list.sort((a, b) => b.score - a.score);
    return list;
  }, [result, query, sort]);

  const labelCls = "w-24 shrink-0 pt-1.5 text-sm font-bold text-indigo-950";

  return (
    <div>
      <section className="bg-gradient-to-b from-indigo-950 via-indigo-900 to-indigo-950 pb-24 pt-14 text-center">
        <div className="mx-auto max-w-4xl px-4">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
            {t.feedTitle}
            <span className="bg-gradient-to-l from-fuchsia-400 to-rose-400 bg-clip-text text-transparent">
              {" "}
              ✈
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-indigo-200">{t.feedSubtitle}</p>
          <div className="mt-4">
            <Link
              href="/planner"
              className="text-sm font-semibold text-fuchsia-300 hover:text-fuchsia-200 hover:underline"
            >
              🪄 {t.heroCtaPlan}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto -mt-16 max-w-5xl px-4">
        <div className="rounded-3xl bg-white p-5 shadow-xl shadow-indigo-950/10 ring-1 ring-slate-200">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <span className={labelCls}>{t.whereChip}</span>
              <div className="flex flex-wrap gap-2">
                {REGIONS.map((r) => (
                  <Chip key={r} active={region === r} onClick={() => setRegion(r)}>
                    {r === "all" ? t.allDestinations : t[`region_${r}` as TranslationKey]}
                  </Chip>
                ))}
                <select
                  value={REGIONS.includes(region) ? "" : region}
                  onChange={(e) => e.target.value && setRegion(e.target.value)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${
                    !REGIONS.includes(region)
                      ? "border-indigo-950 bg-indigo-950 text-white"
                      : "border-slate-200 bg-slate-100 text-slate-600"
                  }`}
                >
                  <option value="">{t.destination}...</option>
                  {destinations.map((d) => (
                    <option key={d.id} value={d.id}>
                      {lt(d.city)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <span className={labelCls}>{t.whenChip}</span>
              <div className="flex flex-wrap gap-2">
                <Chip active={month === "any"} onClick={() => setMonth("any")}>
                  {t.anyMonth}
                </Chip>
                {months.map((m) => (
                  <Chip key={m} active={month === m} onClick={() => setMonth(m)}>
                    {monthLabel(m)}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <span className={labelCls}>{t.nightsChip}</span>
              <div className="flex flex-wrap gap-2">
                {NIGHTS.map((n) => (
                  <Chip key={n} active={nights === n} onClick={() => setNights(n)}>
                    {t[`nights_${n}` as TranslationKey]}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <span className={labelCls}>{t.typeChip}</span>
              <div className="flex flex-wrap gap-2">
                {TYPES.map((ty) => (
                  <Chip key={ty} active={type === ty} onClick={() => setType(ty)}>
                    {ty === "any" ? t.filterAll : t[`tag_${ty}` as TranslationKey]}
                  </Chip>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowMore((s) => !s)}
              className="self-start text-sm font-semibold text-fuchsia-700 hover:underline"
            >
              {showMore ? `− ${t.lessFilters}` : `+ ${t.moreFilters}`}
            </button>

            {showMore && (
              <div className="flex flex-wrap items-center gap-5 rounded-2xl bg-slate-50 p-4">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  {t.boardBasis}:
                  <select
                    value={board}
                    onChange={(e) => setBoard(e.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm"
                  >
                    {BOARDS.map((b) => (
                      <option key={b} value={b}>
                        {b === "any" ? t.filterAll : t[`board_${b}` as TranslationKey]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={directOnly}
                    onChange={(e) => setDirectOnly(e.target.checked)}
                    className="h-4 w-4 accent-fuchsia-600"
                  />
                  {t.directFlightsOnly}
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  {t.maxPricePerPerson}: ${maxPrice}
                  <input
                    type="range"
                    min={300}
                    max={3000}
                    step={100}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="accent-fuchsia-600"
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-indigo-950">
            {loading ? t.loadingDeals : `${deals.length} ${t.dealsFound}`}
          </h2>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
            {t.sortBy}:
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm"
            >
              <option value="score">{t.sortRecommended}</option>
              <option value="price">{t.sortPrice}</option>
              <option value="date">{t.sortDate}</option>
            </select>
          </label>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl bg-slate-200" />
            ))}
          </div>
        ) : deals.length === 0 ? (
          <p className="py-16 text-center text-slate-500">{t.noResults}</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {deals.map((d) => (
              <DealCard key={d.id} deal={d} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
