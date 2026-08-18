import { NextRequest, NextResponse } from "next/server";
import { searchFlights } from "@/lib/data/flights";

export function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const from = searchParams.get("from") ?? "TLV";
  const to = searchParams.get("to") ?? "";
  const date = searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
  const returnDate = searchParams.get("returnDate");

  if (!to) {
    return NextResponse.json({ error: "Missing 'to' parameter" }, { status: 400 });
  }

  const outbound = searchFlights(from, to, date);
  const inbound = returnDate ? searchFlights(to, from, returnDate) : [];
  return NextResponse.json({ outbound, inbound });
}
