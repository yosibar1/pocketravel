"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";
import { DealCard } from "@/components/DealCard";
import { destinations, origins } from "@/lib/data/destinations";
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
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
        active ? "bg-neutral-900 text-white" : "bg-white text-neutral-600 ring-1 ring-neutral-200 hover:bg-neutral-50"
      }`}
    >
      {children}
    </button>
  );
}

function FieldRow({
  icon,
  value,
  open,
  onToggle,
  children,
}: {
  icon: string;
  value: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className={`flex w-full items-center gap-3 rounded-full px-5 py-3.5 text-start transition-colors ${
          open ? "bg-neutral-200/80" : "bg-neutral-100 hover:bg-neutral-200/60"
        }`}
      >
        <span className="text-lg" aria-hidden>
          {icon}
        </span>
        <span className="font-medium text-neutral-800">{value}</span>
      </button>
      {open && <div className="flex flex-wrap gap-2 px-2 py-3">{children}</div>}
    </div>
  );
}

export default function HomePage() {
  const { t, lt, lang } = useLang();
  const locale = lang === "he" ? "he-IL" : "en-US";

  const [origin, setOrigin] = useState("TLV");
  const [type, setType] = useState("any");
  const [region, setRegion] = useState("all");
  const [month, setMonth] = useState("any");
  const [nights, setNights] = useState("any");
  const [adults, setAdults] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [board, setBoard] = useState("any");
  const [minStars, setMinStars] = useState(0);
  const [maxPrice, setMaxPrice] = useState(3000);
  const [directOnly, setDirectOnly] = useState(false);
  const [luggageOnly, setLuggageOnly] = useState(false);
  const [openRow, setOpenRow] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);
  const [sort, setSort] = useState<"price" | "date" | "score">("score");

  const months = useMemo(() => upcomingMonthKeys(4), []);
  const monthLabel = (key: string) => {
    const [y, m] = key.split("-").map(Number);
    return new Intl.DateTimeFormat(locale, { month: "long" }).format(new Date(y, m - 1, 1));
  };

  const toggleRow = (row: string) => setOpenRow((r) => (r === row ? null : row));

  const clearAll = () => {
    setOrigin("TLV");
    setType("any");
    setRegion("all");
    setMonth("any");
    setNights("any");
    setAdults(2);
    setRooms(1);
    setBoard("any");
    setMinStars(0);
    setMaxPrice(3000);
    setDirectOnly(false);
    setLuggageOnly(false);
    setOpenRow(null);
  };

  const query = useMemo(() => {
    const p = new URLSearchParams({ region, month, nights, type, board });
    if (directOnly) p.set("direct", "1");
    if (luggageOnly) p.set("luggage", "1");
    if (minStars) p.set("stars", String(minStars));
    if (maxPrice < 3000) p.set("maxPrice", String(maxPrice));
    return p.toString();
  }, [region, month, nights, type, board, directOnly, luggageOnly, minStars, maxPrice]);

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

  const originLabel = origins.find((o) => o.code === origin)?.label ?? origins[0].label;
  const placeValue =
    region === "all"
      ? t.allDestinations
      : REGIONS.includes(region)
        ? t[`region_${region}` as TranslationKey]
        : (() => {
            const d = destinations.find((x) => x.id === region);
            return d ? lt(d.city) : t.allDestinations;
          })();
  const datesValue =
    (month === "any" ? t.allDates : monthLabel(month)) +
    (nights !== "any" ? ` · ${t[`nights_${nights}` as TranslationKey]}` : "");
  const budgetValue =
    maxPrice >= 3000 ? `${t.budgetLabel}: ${t.noLimit}` : `${t.budgetLabel}: $${maxPrice} -`;

  return (
    <div className="bg-white">
      <section className="mx-auto max-w-xl px-4 pb-4 pt-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-neutral-900">{t.searchWhatTitle}</h1>
          <Link
            href="/planner"
            className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-200"
          >
            {t.aiTripFinder} <span aria-hidden>✨</span>
          </Link>
        </div>

        <div className="mt-5 flex flex-col gap-3">
          <FieldRow icon="🛫" value={lt(originLabel)} open={openRow === "origin"} onToggle={() => toggleRow("origin")}>
            {origins.map((o) => (
              <Chip key={o.code} active={origin === o.code} onClick={() => setOrigin(o.code)}>
                {lt(o.label)}
              </Chip>
            ))}
          </FieldRow>

          <FieldRow
            icon="🗺️"
            value={type === "any" ? t.allVacationTypes : t[`tag_${type}` as TranslationKey]}
            open={openRow === "type"}
            onToggle={() => toggleRow("type")}
          >
            {TYPES.map((ty) => (
              <Chip key={ty} active={type === ty} onClick={() => setType(ty)}>
                {ty === "any" ? t.allVacationTypes : t[`tag_${ty}` as TranslationKey]}
              </Chip>
            ))}
          </FieldRow>

          <FieldRow icon="📍" value={placeValue} open={openRow === "place"} onToggle={() => toggleRow("place")}>
            {REGIONS.map((r) => (
              <Chip key={r} active={region === r} onClick={() => setRegion(r)}>
                {r === "all" ? t.allDestinations : t[`region_${r}` as TranslationKey]}
              </Chip>
            ))}
            <div className="mt-1 flex w-full flex-wrap gap-2">
              {destinations.map((d) => (
                <Chip key={d.id} active={region === d.id} onClick={() => setRegion(d.id)}>
                  {lt(d.city)}
                </Chip>
              ))}
            </div>
          </FieldRow>

          <FieldRow icon="📅" value={datesValue} open={openRow === "dates"} onToggle={() => toggleRow("dates")}>
            <Chip active={month === "any"} onClick={() => setMonth("any")}>
              {t.anyMonth}
            </Chip>
            {months.map((m) => (
              <Chip key={m} active={month === m} onClick={() => setMonth(m)}>
                {monthLabel(m)}
              </Chip>
            ))}
            <div className="mt-1 flex w-full flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-neutral-500">{t.nightsChip}</span>
              {NIGHTS.map((n) => (
                <Chip key={n} active={nights === n} onClick={() => setNights(n)}>
                  {t[`nights_${n}` as TranslationKey]}
                </Chip>
              ))}
            </div>
          </FieldRow>

          <FieldRow
            icon="👤"
            value={`${adults} ${t.adultsLabel}, ${rooms} ${t.roomLabel}`}
            open={openRow === "pax"}
            onToggle={() => toggleRow("pax")}
          >
            <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
              {t.adultsLabel}:
              <select
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
                className="rounded-lg border border-neutral-300 bg-white px-2 py-1 text-sm"
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
              {t.roomLabel}:
              <select
                value={rooms}
                onChange={(e) => setRooms(Number(e.target.value))}
                className="rounded-lg border border-neutral-300 bg-white px-2 py-1 text-sm"
              >
                {[1, 2, 3].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </FieldRow>

          {!showMore ? (
            <button
              type="button"
              onClick={() => setShowMore(true)}
              className="flex w-full items-center gap-3 rounded-full bg-neutral-100 px-5 py-3.5 text-start font-medium text-neutral-800 transition-colors hover:bg-neutral-200/60"
            >
              <span className="text-lg" aria-hidden>
                ＋
              </span>
              {t.moreFilters}
            </button>
          ) : (
            <>
              <FieldRow icon="💰" value={budgetValue} open={openRow === "budget"} onToggle={() => toggleRow("budget")}>
                <label className="flex w-full items-center gap-3 text-sm font-medium text-neutral-700">
                  ${maxPrice >= 3000 ? "∞" : maxPrice}
                  <input
                    type="range"
                    min={300}
                    max={3000}
                    step={100}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="flex-1 accent-neutral-900"
                  />
                </label>
              </FieldRow>

              <FieldRow
                icon="⭐"
                value={minStars ? `${minStars}+ ${t.hotelStars}` : t.hotelStars}
                open={openRow === "stars"}
                onToggle={() => toggleRow("stars")}
              >
                {[0, 3, 4, 5].map((s) => (
                  <Chip key={s} active={minStars === s} onClick={() => setMinStars(s)}>
                    {s === 0 ? t.anyOption : `${"★".repeat(s)}${s < 5 ? "+" : ""}`}
                  </Chip>
                ))}
              </FieldRow>

              <FieldRow
                icon="🍽️"
                value={board === "any" ? t.boardBasis : t[`board_${board}` as TranslationKey]}
                open={openRow === "board"}
                onToggle={() => toggleRow("board")}
              >
                {BOARDS.map((b) => (
                  <Chip key={b} active={board === b} onClick={() => setBoard(b)}>
                    {b === "any" ? t.anyOption : t[`board_${b}` as TranslationKey]}
                  </Chip>
                ))}
              </FieldRow>

              <FieldRow
                icon="✈️"
                value={directOnly ? t.directFlight : t.stopsLabel}
                open={openRow === "stops"}
                onToggle={() => toggleRow("stops")}
              >
                <Chip active={!directOnly} onClick={() => setDirectOnly(false)}>
                  {t.anyOption}
                </Chip>
                <Chip active={directOnly} onClick={() => setDirectOnly(true)}>
                  {t.directOnly}
                </Chip>
              </FieldRow>

              <FieldRow
                icon="🧳"
                value={luggageOnly ? t.luggageIncluded : t.luggageLabel}
                open={openRow === "luggage"}
                onToggle={() => toggleRow("luggage")}
              >
                <Chip active={!luggageOnly} onClick={() => setLuggageOnly(false)}>
                  {t.luggageAny}
                </Chip>
                <Chip active={luggageOnly} onClick={() => setLuggageOnly(true)}>
                  {t.luggageIncluded}
                </Chip>
              </FieldRow>
            </>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={clearAll}
            className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-200"
          >
            🧹 {t.clearAll}
          </button>
          <a
            href="#results"
            className="flex-1 rounded-full bg-neutral-900 px-6 py-3.5 text-center font-bold text-white transition-colors hover:bg-neutral-800"
          >
            {loading ? t.counting : t.showResults.replace("{n}", String(deals.length))}
          </a>
        </div>
      </section>

      <section id="results" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-10">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900">
            {loading ? t.loadingDeals : `${deals.length} ${t.dealsFound}`}
          </h2>
          <label className="flex items-center gap-2 text-sm font-medium text-neutral-600">
            {t.sortBy}:
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="rounded-lg border border-neutral-300 bg-white px-2 py-1 text-sm"
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
              <div key={i} className="h-80 animate-pulse rounded-2xl bg-neutral-100" />
            ))}
          </div>
        ) : deals.length === 0 ? (
          <p className="py-16 text-center text-neutral-500">{t.noResults}</p>
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
