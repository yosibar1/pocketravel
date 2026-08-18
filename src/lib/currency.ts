import type { Lang } from "@/lib/types";

// Demo conversion rate; replace with a live FX feed when going to production.
export const USD_TO_ILS = 3.65;

export function formatPrice(usd: number, lang: Lang): string {
  if (lang === "he") {
    const ils = Math.round((usd * USD_TO_ILS) / 10) * 10;
    return `₪${ils.toLocaleString("he-IL")}`;
  }
  return `$${Math.round(usd).toLocaleString("en-US")}`;
}
