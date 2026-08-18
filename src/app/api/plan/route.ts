import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildRulePlan, type PlannerRequest } from "@/lib/planner";
import { getDestination } from "@/lib/data/destinations";
import { lt } from "@/lib/i18n";
import type { ItineraryPlan } from "@/lib/types";

export const maxDuration = 60;

async function buildAiPlan(req: PlannerRequest, apiKey: string): Promise<ItineraryPlan> {
  const dest = getDestination(req.destinationId);
  if (!dest) throw new Error("Unknown destination");

  const client = new Anthropic({ apiKey });
  const langName = req.lang === "he" ? "Hebrew" : "English";
  const city = lt(dest.city, "en");

  const prompt = `You are a travel planner. Build a day-by-day vacation itinerary.

Destination: ${city}, ${lt(dest.country, "en")}
Days: ${req.days}
Budget per person: $${req.budgetUSD}
Style: ${req.style}
Interests: ${req.interests.join(", ") || "general"}
Extra notes from the traveler: ${req.freeText || "none"}

Respond in ${langName}. Return ONLY valid JSON matching this TypeScript type, no markdown fences:
{
  "destination": string,
  "summary": string,
  "days": [{ "day": number, "title": string, "activities": [{ "time": "HH:mm", "title": string, "description": string, "category": "food"|"sight"|"activity"|"transit"|"rest" }] }],
  "estimatedBudgetUSD": number,
  "tips": string[]
}
Day 1 should include arrival/check-in and the last day should include check-out/departure. Keep descriptions short (one sentence).`;

  const message = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf("}");
  const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
  return { ...parsed, source: "ai" as const };
}

export async function POST(req: NextRequest) {
  let body: PlannerRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.destinationId || !body.days || body.days < 1 || body.days > 21) {
    return NextResponse.json({ error: "Invalid planner request" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey) {
    try {
      const plan = await buildAiPlan(body, apiKey);
      return NextResponse.json({ plan });
    } catch (err) {
      // Fall back to the rule-based planner on any AI failure.
      console.error("AI planner failed, falling back to rules:", err);
    }
  }

  const plan = buildRulePlan(body);
  return NextResponse.json({ plan });
}
