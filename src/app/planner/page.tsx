"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLang } from "@/components/LanguageProvider";
import { destinations } from "@/lib/data/destinations";
import type { ItineraryPlan } from "@/lib/types";
import type { TranslationKey } from "@/lib/i18n";

const INTERESTS = ["food", "culture", "nature", "beach", "shopping", "family", "romantic"];
const CATEGORY_ICON: Record<string, string> = {
  food: "🍽️",
  sight: "📸",
  activity: "🎯",
  transit: "🚕",
  rest: "🧘",
};

function PlannerForm() {
  const { t, lt, lang } = useLang();
  const searchParams = useSearchParams();

  const [destinationId, setDestinationId] = useState(
    searchParams.get("destination") ?? "santorini"
  );
  const [days, setDays] = useState(Number(searchParams.get("days")) || 5);
  const [budget, setBudget] = useState(1200);
  const [style, setStyle] = useState<"relaxed" | "balanced" | "packed">("balanced");
  const [interests, setInterests] = useState<string[]>([]);
  const [freeText, setFreeText] = useState("");
  const [plan, setPlan] = useState<ItineraryPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const toggleInterest = (i: string) =>
    setInterests((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    setPlan(null);
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinationId,
          days,
          budgetUSD: budget,
          style,
          interests,
          freeText,
          lang,
        }),
      });
      if (!res.ok) throw new Error("plan failed");
      const data = await res.json();
      setPlan(data.plan);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200";
  const labelCls = "mb-1 block text-sm font-semibold text-slate-700";

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold">🪄 {t.plannerTitle}</h1>
        <p className="mt-2 text-slate-600">{t.plannerSubtitle}</p>
      </div>

      <form
        onSubmit={generate}
        className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className={labelCls}>{t.plannerDestination}</label>
            <select
              value={destinationId}
              onChange={(e) => setDestinationId(e.target.value)}
              className={inputCls}
            >
              {destinations.map((d) => (
                <option key={d.id} value={d.id}>
                  {lt(d.city)}, {lt(d.country)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>{t.plannerDays}</label>
            <input
              type="number"
              min={2}
              max={21}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>{t.plannerBudget}</label>
            <input
              type="number"
              min={100}
              step={100}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className={inputCls}
            />
          </div>
        </div>

        <div className="mt-4">
          <label className={labelCls}>{t.plannerStyle}</label>
          <div className="flex gap-2">
            {(["relaxed", "balanced", "packed"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStyle(s)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  style === s
                    ? "bg-sky-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {t[`style_${s}` as TranslationKey]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <label className={labelCls}>{t.plannerInterests}</label>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleInterest(i)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  interests.includes(i)
                    ? "bg-sky-100 text-sky-700 ring-1 ring-sky-400"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {t[`tag_${i}` as TranslationKey] ?? i}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <label className={labelCls}>{t.plannerFreeText}</label>
          <textarea
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            placeholder={t.plannerFreeTextPlaceholder}
            rows={2}
            className={inputCls}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-sky-600 py-3 font-bold text-white transition-colors hover:bg-sky-700 disabled:opacity-60"
        >
          {loading ? t.plannerGenerating : t.plannerGenerate}
        </button>
      </form>

      {error && <p className="mt-6 text-center text-red-600">{t.noResults}</p>}

      {plan && (
        <div className="mt-10">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-extrabold">{plan.destination}</h2>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    plan.source === "ai"
                      ? "bg-violet-100 text-violet-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {plan.source === "ai" ? `✨ ${t.plannerAiBadge}` : t.plannerRulesBadge}
                </span>
                <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700">
                  {t.estimatedBudget}: ${plan.estimatedBudgetUSD}
                </span>
              </div>
            </div>
            <p className="mt-2 text-slate-600">{plan.summary}</p>
            {plan.source === "rules" && (
              <p className="mt-2 text-xs text-slate-400">{t.aiUnavailableNote}</p>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-4">
            {plan.days.map((day) => (
              <div
                key={day.day}
                className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
              >
                <h3 className="font-bold text-sky-700">
                  {t.day} {day.day} — {day.title}
                </h3>
                <ul className="mt-3 flex flex-col gap-3">
                  {day.activities.map((act, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="mt-0.5 w-12 shrink-0 text-sm font-bold text-slate-400">
                        {act.time}
                      </span>
                      <span aria-hidden>{CATEGORY_ICON[act.category] ?? "•"}</span>
                      <div>
                        <div className="font-medium">{act.title}</div>
                        {act.description && (
                          <div className="text-sm text-slate-500">{act.description}</div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {plan.tips.length > 0 && (
            <div className="mt-6 rounded-3xl bg-amber-50 p-6 ring-1 ring-amber-200">
              <h3 className="font-bold text-amber-800">💡 {t.tips}</h3>
              <ul className="mt-2 flex flex-col gap-1 text-sm text-amber-900">
                {plan.tips.map((tip, i) => (
                  <li key={i}>• {tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PlannerPage() {
  return (
    <Suspense>
      <PlannerForm />
    </Suspense>
  );
}
