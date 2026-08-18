import type { BoardBasis, Deal, DealDateVariant } from "@/lib/types";
import { destinations, getDestination } from "./destinations";
import { getHotel, getHotelsForDestination } from "./hotels";

// Destination groups used by the feed's "where to" chips.
export const regionGroups: Record<string, string[]> = {
  europe: ["paris", "london", "amsterdam", "prague", "rome", "barcelona", "lisbon", "innsbruck"],
  mediterranean: ["santorini", "barcelona", "lisbon", "rome"],
  fareast: ["tokyo", "bangkok", "bali"],
  exotic: ["maldives", "bali", "rio", "dubai"],
};

function seeded(seed: string): () => number {
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

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

const BOARD_UPLIFT: Record<BoardBasis, number> = { RO: 0, BB: 0.08, HB: 0.2, AI: 0.38 };

function pickBoard(rand: () => number, tags: string[]): BoardBasis {
  const beachy = tags.includes("beach") || tags.includes("luxury");
  const r = rand();
  if (beachy) return r < 0.4 ? "AI" : r < 0.7 ? "HB" : "BB";
  return r < 0.45 ? "BB" : r < 0.7 ? "RO" : "HB";
}

function dealPrice(
  destAvgFlight: number,
  hotelNight: number,
  nights: number,
  board: BoardBasis,
  direct: boolean,
  rand: () => number
): number {
  const flight = destAvgFlight * (0.8 + rand() * 0.4) * (direct ? 1.12 : 0.95);
  const hotel = hotelNight * nights * 0.5 * (1 + BOARD_UPLIFT[board]);
  // Packages undercut booking separately by ~12%.
  return Math.round((flight + hotel) * 0.88);
}

// Deals for a destination in a given month (YYYY-MM). Deterministic per
// destination+month so the feed and deal pages stay stable across requests.
function dealsForDestinationMonth(destinationId: string, month: string): Deal[] {
  const dest = getDestination(destinationId);
  if (!dest) return [];
  const hotels = getHotelsForDestination(destinationId);
  const rand = seeded(`${destinationId}-${month}`);
  const [y, m] = month.split("-").map(Number);
  const count = 2 + Math.floor(rand() * 3);
  const deals: Deal[] = [];

  for (let i = 0; i < count; i++) {
    const day = 1 + Math.floor(rand() * 24);
    const start = new Date(Date.UTC(y, m - 1, day));
    const nights = 3 + Math.floor(rand() * 5);
    const hotel = hotels[Math.floor(rand() * hotels.length)];
    const board = pickBoard(rand, dest.tags);
    const direct = rand() < 0.6;
    const price = dealPrice(dest.avgFlightPriceUSD, hotel.pricePerNightUSD, nights, board, direct, rand);
    const dropped = rand() < 0.25;

    deals.push({
      id: `${destinationId}-${month}-${i}`,
      destinationId,
      hotelId: hotel.id,
      startDate: iso(start),
      endDate: iso(addDays(start, nights)),
      nights,
      boardBasis: board,
      directFlight: direct,
      luggageIncluded: rand() < 0.7,
      pricePerPersonUSD: price,
      originalPriceUSD: dropped ? Math.round(price * (1.1 + rand() * 0.15)) : undefined,
      isHot: rand() < 0.2,
      score: Math.round(40 + rand() * 60),
    });
  }
  return deals;
}

export function upcomingMonths(count: number, from = new Date()): string[] {
  const months: string[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(from.getFullYear(), from.getMonth() + i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return months;
}

export interface DealFilters {
  region?: string; // "all" | region group key | destination id
  month?: string; // "any" | YYYY-MM
  nights?: string; // "any" | "short" (3-4) | "week" (5-7) | "long" (8+)
  type?: string; // "any" | destination tag
  board?: string; // "any" | BoardBasis
  maxPriceUSD?: number;
  directOnly?: boolean;
  minStars?: number;
  luggageOnly?: boolean;
}

export function searchDeals(filters: DealFilters): Deal[] {
  let destIds: string[];
  if (!filters.region || filters.region === "all") {
    destIds = destinations.map((d) => d.id);
  } else if (regionGroups[filters.region]) {
    destIds = regionGroups[filters.region];
  } else {
    destIds = [filters.region];
  }

  if (filters.type && filters.type !== "any") {
    destIds = destIds.filter((id) => getDestination(id)?.tags.includes(filters.type!));
  }

  const months =
    filters.month && filters.month !== "any" ? [filters.month] : upcomingMonths(3);

  let deals = destIds.flatMap((id) => months.flatMap((mo) => dealsForDestinationMonth(id, mo)));

  if (filters.nights && filters.nights !== "any") {
    deals = deals.filter((d) =>
      filters.nights === "short" ? d.nights <= 4 : filters.nights === "week" ? d.nights >= 5 && d.nights <= 7 : d.nights >= 8
    );
  }
  if (filters.board && filters.board !== "any") {
    deals = deals.filter((d) => d.boardBasis === filters.board);
  }
  if (filters.maxPriceUSD) {
    deals = deals.filter((d) => d.pricePerPersonUSD <= filters.maxPriceUSD!);
  }
  if (filters.directOnly) {
    deals = deals.filter((d) => d.directFlight);
  }
  if (filters.minStars) {
    deals = deals.filter((d) => (getHotel(d.hotelId)?.stars ?? 0) >= filters.minStars!);
  }
  if (filters.luggageOnly) {
    deals = deals.filter((d) => d.luggageIncluded);
  }

  return deals.sort((a, b) => a.pricePerPersonUSD - b.pricePerPersonUSD);
}

export function getDeal(id: string): Deal | undefined {
  // id format: <destinationId>-<YYYY-MM>-<index>
  const match = id.match(/^(.+)-(\d{4}-\d{2})-(\d+)$/);
  if (!match) return undefined;
  return dealsForDestinationMonth(match[1], match[2]).find((d) => d.id === id);
}

// The "price calendar": the same package on nearby departure dates.
export function getDateVariants(deal: Deal): DealDateVariant[] {
  const rand = seeded(`${deal.id}-variants`);
  const base = new Date(deal.startDate + "T00:00:00Z");
  const variants: DealDateVariant[] = [];
  for (let offset = -6; offset <= 6; offset += 3) {
    const start = addDays(base, offset);
    const price =
      offset === 0
        ? deal.pricePerPersonUSD
        : Math.round(deal.pricePerPersonUSD * (0.85 + rand() * 0.35));
    variants.push({
      startDate: iso(start),
      endDate: iso(addDays(start, deal.nights)),
      pricePerPersonUSD: price,
      isCheapest: false,
    });
  }
  const min = Math.min(...variants.map((v) => v.pricePerPersonUSD));
  return variants.map((v) => ({ ...v, isCheapest: v.pricePerPersonUSD === min }));
}
