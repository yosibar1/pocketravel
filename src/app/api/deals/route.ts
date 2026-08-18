import { NextRequest, NextResponse } from "next/server";
import { searchDeals } from "@/lib/data/deals";

export function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const deals = searchDeals({
    region: p.get("region") ?? "all",
    month: p.get("month") ?? "any",
    nights: p.get("nights") ?? "any",
    type: p.get("type") ?? "any",
    board: p.get("board") ?? "any",
    maxPriceUSD: p.get("maxPrice") ? Number(p.get("maxPrice")) : undefined,
    directOnly: p.get("direct") === "1",
    minStars: p.get("stars") ? Number(p.get("stars")) : undefined,
    luggageOnly: p.get("luggage") === "1",
  });
  return NextResponse.json({ deals: deals.slice(0, 60) });
}
