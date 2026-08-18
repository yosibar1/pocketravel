import { NextRequest, NextResponse } from "next/server";
import { getHotelsForDestination, hotels } from "@/lib/data/hotels";

export function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const destinationId = searchParams.get("destination");
  const results = destinationId ? getHotelsForDestination(destinationId) : hotels;
  return NextResponse.json({ hotels: results });
}
