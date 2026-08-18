import type { Flight, LocalizedText } from "@/lib/types";
import { getDestinationByAirport } from "./destinations";

interface Airline {
  code: string;
  name: LocalizedText;
  priceFactor: number;
}

const airlines: Airline[] = [
  { code: "LY", name: { he: "אל על", en: "El Al" }, priceFactor: 1.1 },
  { code: "W6", name: { he: "Wizz Air", en: "Wizz Air" }, priceFactor: 0.7 },
  { code: "LH", name: { he: "לופטהנזה", en: "Lufthansa" }, priceFactor: 1.05 },
  { code: "AF", name: { he: "אייר פראנס", en: "Air France" }, priceFactor: 1.0 },
  { code: "EK", name: { he: "אמירייטס", en: "Emirates" }, priceFactor: 1.15 },
  { code: "TK", name: { he: "טורקיש איירליינס", en: "Turkish Airlines" }, priceFactor: 0.85 },
  { code: "U2", name: { he: "easyJet", en: "easyJet" }, priceFactor: 0.75 },
  { code: "BA", name: { he: "בריטיש איירווייס", en: "British Airways" }, priceFactor: 1.05 },
];

const stopCities: LocalizedText[] = [
  { he: "איסטנבול", en: "Istanbul" },
  { he: "וינה", en: "Vienna" },
  { he: "אתונה", en: "Athens" },
  { he: "מינכן", en: "Munich" },
  { he: "לרנקה", en: "Larnaca" },
];

// Deterministic pseudo-random generator so the same search always returns
// the same demo results (stable URLs, stable prices).
function seededRandom(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 10000) / 10000;
  };
}

function minutesToHHMM(total: number): string {
  const m = ((total % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

export function searchFlights(from: string, to: string, date: string): Flight[] {
  const dest = getDestinationByAirport(to);
  const basePrice = dest?.avgFlightPriceUSD ?? 400;
  const rand = seededRandom(`${from}-${to}-${date}`);
  const count = 6 + Math.floor(rand() * 5);
  const baseDuration = 120 + Math.floor((basePrice / 900) * 700);

  const flights: Flight[] = [];
  for (let i = 0; i < count; i++) {
    const airline = airlines[Math.floor(rand() * airlines.length)];
    const stops = rand() < 0.55 ? 0 : rand() < 0.85 ? 1 : 2;
    const departMinutes = 300 + Math.floor(rand() * 1080);
    const durationMinutes =
      baseDuration + Math.floor(rand() * 60) + stops * (90 + Math.floor(rand() * 120));
    const price = Math.round(
      basePrice * airline.priceFactor * (0.75 + rand() * 0.6) * (stops === 0 ? 1.15 : 1) -
        stops * 25
    );

    flights.push({
      id: `${airline.code}${100 + Math.floor(rand() * 900)}-${date}-${i}`,
      airline: airline.name,
      airlineCode: airline.code,
      from,
      to,
      departTime: minutesToHHMM(departMinutes),
      arriveTime: minutesToHHMM(departMinutes + durationMinutes),
      durationMinutes,
      stops,
      stopCity: stops > 0 ? stopCities[Math.floor(rand() * stopCities.length)] : undefined,
      priceUSD: Math.max(price, 79),
      cabin: "economy",
      date,
    });
  }
  return flights.sort((a, b) => a.priceUSD - b.priceUSD);
}
