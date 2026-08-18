"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLang } from "./LanguageProvider";
import { destinations, getDestinationByAirport, origins } from "@/lib/data/destinations";

function plusDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

type Tab = "flights" | "hotels";

export function SearchBox({ initialTab = "flights" }: { initialTab?: Tab }) {
  const { t, lt } = useLang();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>(initialTab);

  const urlTo = searchParams.get("to");
  const initialDest =
    searchParams.get("destination") ??
    (urlTo ? getDestinationByAirport(urlTo)?.id : undefined) ??
    "paris";

  const [from, setFrom] = useState(searchParams.get("from") ?? "TLV");
  const [to, setTo] = useState(initialDest);
  const [departDate, setDepartDate] = useState(
    searchParams.get("date") ?? searchParams.get("checkIn") ?? plusDays(14)
  );
  const [returnDate, setReturnDate] = useState(
    searchParams.get("returnDate") ?? searchParams.get("checkOut") ?? plusDays(19)
  );
  const [passengers, setPassengers] = useState(
    Number(searchParams.get("passengers") ?? searchParams.get("guests")) || 2
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const dest = destinations.find((d) => d.id === to);
    if (tab === "flights") {
      const params = new URLSearchParams({
        from,
        to: dest?.airportCode ?? "CDG",
        date: departDate,
        returnDate,
        passengers: String(passengers),
      });
      router.push(`/flights?${params}`);
    } else {
      const params = new URLSearchParams({
        destination: to,
        checkIn: departDate,
        checkOut: returnDate,
        guests: String(passengers),
      });
      router.push(`/hotels?${params}`);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200";
  const labelCls = "mb-1 block text-xs font-semibold text-slate-500";

  return (
    <div className="w-full max-w-4xl rounded-2xl bg-white p-4 shadow-xl shadow-slate-200/60 sm:p-6">
      <div className="mb-4 flex gap-2">
        {(["flights", "hotels"] as const).map((tb) => (
          <button
            key={tb}
            type="button"
            onClick={() => setTab(tb)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              tab === tb ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {tb === "flights" ? `✈️ ${t.navFlights}` : `🏨 ${t.navHotels}`}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="grid grid-cols-2 gap-3 md:grid-cols-6">
        {tab === "flights" && (
          <div className="col-span-2 md:col-span-1">
            <label className={labelCls}>{t.from}</label>
            <select value={from} onChange={(e) => setFrom(e.target.value)} className={inputCls}>
              {origins.map((o) => (
                <option key={o.code} value={o.code}>
                  {lt(o.label)}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className={`col-span-2 ${tab === "flights" ? "md:col-span-1" : "md:col-span-2"}`}>
          <label className={labelCls}>{tab === "flights" ? t.to : t.destination}</label>
          <select value={to} onChange={(e) => setTo(e.target.value)} className={inputCls}>
            {destinations.map((d) => (
              <option key={d.id} value={d.id}>
                {lt(d.city)}, {lt(d.country)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls}>{tab === "flights" ? t.departDate : t.checkIn}</label>
          <input
            type="date"
            value={departDate}
            onChange={(e) => setDepartDate(e.target.value)}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>{tab === "flights" ? t.returnDate : t.checkOut}</label>
          <input
            type="date"
            value={returnDate}
            min={departDate}
            onChange={(e) => setReturnDate(e.target.value)}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>{tab === "flights" ? t.passengers : t.guests}</label>
          <select
            value={passengers}
            onChange={(e) => setPassengers(Number(e.target.value))}
            className={inputCls}
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-2 flex items-end md:col-span-1">
          <button
            type="submit"
            className="w-full rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-sky-700"
          >
            {t.search}
          </button>
        </div>
      </form>
    </div>
  );
}
