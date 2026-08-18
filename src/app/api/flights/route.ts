import { NextRequest, NextResponse } from "next/server";
import { searchFlights } from "@/lib/data/flights";
import { tpConfigured, tpPricesForDates, tpRowToFlight } from "@/lib/providers/travelpayouts";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const from = searchParams.get("from") ?? "TLV";
  const to = searchParams.get("to") ?? "";
  const date = searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
  const returnDate = searchParams.get("returnDate");

  if (!to) {
    return NextResponse.json({ error: "Missing 'to' parameter" }, { status: 400 });
  }

  // Live prices via Travelpayouts when a token is configured; the demo
  // generator remains the fallback for local dev and API outages.
  if (tpConfigured()) {
    const [liveOutbound, liveInbound] = await Promise.all([
      tpPricesForDates(from, to, date),
      returnDate ? tpPricesForDates(to, from, returnDate) : Promise.resolve(null),
    ]);
    if (liveOutbound && liveOutbound.length > 0) {
      return NextResponse.json({
        outbound: liveOutbound.map(tpRowToFlight),
        inbound: (liveInbound ?? []).map(tpRowToFlight),
        source: "travelpayouts",
      });
    }
  }

  const outbound = searchFlights(from, to, date);
  const inbound = returnDate ? searchFlights(to, from, returnDate) : [];
  return NextResponse.json({ outbound, inbound, source: "demo" });
}
