import type { Flight, LocalizedText } from "@/lib/types";

// Travelpayouts (Aviasales) data API — real cached flight prices.
// Docs: https://travelpayouts.github.io/slate/
// Activates when TRAVELPAYOUTS_TOKEN is set; all callers must fall back to
// the demo generator when functions here return null.

interface TpPriceRow {
  origin: string;
  destination: string;
  departure_at: string; // ISO datetime
  return_at?: string;
  price: number;
  airline: string; // IATA code
  flight_number: string;
  transfers: number;
  duration: number; // minutes, whole trip
  duration_to?: number; // minutes, outbound leg
  link?: string;
}

const AIRLINE_NAMES: Record<string, LocalizedText> = {
  LY: { he: "אל על", en: "El Al" },
  IZ: { he: "ארקיע", en: "Arkia" },
  "6H": { he: "ישראייר", en: "Israir" },
  W6: { he: "Wizz Air", en: "Wizz Air" },
  U2: { he: "easyJet", en: "easyJet" },
  FR: { he: "ריינאייר", en: "Ryanair" },
  LH: { he: "לופטהנזה", en: "Lufthansa" },
  AF: { he: "אייר פראנס", en: "Air France" },
  BA: { he: "בריטיש איירווייס", en: "British Airways" },
  TK: { he: "טורקיש איירליינס", en: "Turkish Airlines" },
  EK: { he: "אמירייטס", en: "Emirates" },
  A3: { he: "איגיאן", en: "Aegean" },
  OS: { he: "אוסטריאן", en: "Austrian" },
  LX: { he: "סוויס", en: "Swiss" },
  KL: { he: "KLM", en: "KLM" },
  AZ: { he: "ITA Airways", en: "ITA Airways" },
  EY: { he: "אתיחאד", en: "Etihad" },
  QR: { he: "קטאר איירווייס", en: "Qatar Airways" },
};

const cache = new Map<string, { at: number; data: TpPriceRow[] }>();
const CACHE_TTL_MS = 30 * 60 * 1000;

export function tpConfigured(): boolean {
  return Boolean(process.env.TRAVELPAYOUTS_TOKEN);
}

export async function tpPricesForDates(
  origin: string,
  destination: string,
  departureAt: string, // YYYY-MM-DD or YYYY-MM
  oneWay = true
): Promise<TpPriceRow[] | null> {
  const token = process.env.TRAVELPAYOUTS_TOKEN;
  if (!token) return null;

  const key = `${origin}|${destination}|${departureAt}|${oneWay}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.data;

  const params = new URLSearchParams({
    origin,
    destination,
    departure_at: departureAt,
    one_way: String(oneWay),
    currency: "usd",
    sorting: "price",
    limit: "30",
    token,
  });

  try {
    const res = await fetch(
      `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?${params}`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) return null;
    cache.set(key, { at: Date.now(), data: json.data });
    return json.data as TpPriceRow[];
  } catch {
    return null;
  }
}

function hhmm(d: Date): string {
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
}

// TP timestamps carry the local UTC offset (e.g. 2026-09-01T09:35:00+03:00);
// shifting by that offset lets us print local wall-clock time via the UTC getters.
function localWallClock(iso: string): Date {
  const offsetMatch = iso.match(/([+-])(\d{2}):(\d{2})$/);
  const d = new Date(iso);
  if (!offsetMatch) return d;
  const sign = offsetMatch[1] === "+" ? 1 : -1;
  const offsetMin = sign * (Number(offsetMatch[2]) * 60 + Number(offsetMatch[3]));
  return new Date(d.getTime() + offsetMin * 60000);
}

export function tpRowToFlight(row: TpPriceRow, index: number): Flight {
  const durationMinutes = row.duration_to ?? row.duration;
  const depart = localWallClock(row.departure_at);
  const arrive = new Date(depart.getTime() + durationMinutes * 60000);
  const airlineName = AIRLINE_NAMES[row.airline] ?? { he: row.airline, en: row.airline };

  return {
    id: `tp-${row.airline}${row.flight_number}-${row.departure_at}-${index}`,
    airline: airlineName,
    airlineCode: row.airline,
    from: row.origin,
    to: row.destination,
    departTime: hhmm(depart),
    arriveTime: hhmm(arrive),
    durationMinutes,
    stops: row.transfers,
    priceUSD: Math.round(row.price),
    cabin: "economy",
    date: row.departure_at.slice(0, 10),
  };
}
