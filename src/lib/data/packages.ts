import type { VacationPackage } from "@/lib/types";
import { getHotelsForDestination } from "./hotels";
import { getDestination } from "./destinations";

function pkg(
  id: string,
  destinationId: string,
  hotelIndex: number,
  nights: number,
  title: { he: string; en: string },
  highlight: { he: string; en: string },
  includes: string[]
): VacationPackage {
  const dest = getDestination(destinationId);
  const hotel = getHotelsForDestination(destinationId)[hotelIndex];
  const flightPart = dest?.avgFlightPriceUSD ?? 400;
  const hotelPart = (hotel?.pricePerNightUSD ?? 100) * nights * 0.5; // per person, double room
  // Bundled price is ~12% below booking separately.
  const price = Math.round((flightPart + hotelPart) * 0.88);
  return {
    id,
    destinationId,
    title,
    nights,
    pricePerPersonUSD: price,
    hotelId: hotel?.id ?? "",
    includes,
    highlight,
  };
}

export const packages: VacationPackage[] = [
  pkg(
    "pkg-santorini-romance",
    "santorini",
    3,
    5,
    { he: "רומנטיקה בסנטוריני", en: "Santorini Romance" },
    { he: "שקיעה פרטית באיה + שיט בקלדרה", en: "Private Oia sunset + caldera cruise" },
    ["flight", "hotel", "breakfast", "transfer"]
  ),
  pkg(
    "pkg-paris-city",
    "paris",
    1,
    4,
    { he: "סוף שבוע ארוך בפריז", en: "Long Weekend in Paris" },
    { he: "כרטיסים ללובר ושיט על הסן כלולים", en: "Louvre tickets & Seine cruise included" },
    ["flight", "hotel", "breakfast"]
  ),
  pkg(
    "pkg-bangkok-adventure",
    "bangkok",
    4,
    7,
    { he: "הרפתקה בבנגקוק", en: "Bangkok Adventure" },
    { he: "סיור אוכל רחוב + שוק צף", en: "Street-food tour + floating market" },
    ["flight", "hotel", "tour"]
  ),
  pkg(
    "pkg-maldives-luxury",
    "maldives",
    0,
    6,
    { he: "פינוק במלדיביים", en: "Maldives Escape" },
    { he: "בקתה מעל המים + חצי פנסיון", en: "Overwater villa + half board" },
    ["flight", "hotel", "breakfast", "transfer"]
  ),
  pkg(
    "pkg-prague-budget",
    "prague",
    5,
    3,
    { he: "פראג במחיר שובר שוק", en: "Prague on a Budget" },
    { he: "סיור מודרך בעיר העתיקה במתנה", en: "Free old-town walking tour" },
    ["flight", "hotel"]
  ),
  pkg(
    "pkg-innsbruck-ski",
    "innsbruck",
    2,
    5,
    { he: "חופשת סקי באלפים", en: "Alpine Ski Week" },
    { he: "סקי פס ל-4 ימים כלול", en: "4-day ski pass included" },
    ["flight", "hotel", "breakfast", "transfer"]
  ),
  pkg(
    "pkg-barcelona-family",
    "barcelona",
    3,
    5,
    { he: "ברצלונה למשפחות", en: "Barcelona for Families" },
    { he: "כניסה לפארק גואל ולאקווריום", en: "Park Güell & aquarium entry" },
    ["flight", "hotel", "breakfast", "car"]
  ),
  pkg(
    "pkg-bali-tropical",
    "bali",
    3,
    8,
    { he: "טרופי בבאלי", en: "Tropical Bali" },
    { he: "יוגה בבוקר + סיור טרסות אורז", en: "Morning yoga + rice-terrace tour" },
    ["flight", "hotel", "breakfast", "tour"]
  ),
  pkg(
    "pkg-dubai-shopping",
    "dubai",
    0,
    4,
    { he: "יוקרה בדובאי", en: "Dubai Luxe" },
    { he: "ספארי מדברי + כרטיס לבורג' חליפה", en: "Desert safari + Burj Khalifa ticket" },
    ["flight", "hotel", "breakfast", "transfer", "tour"]
  ),
  pkg(
    "pkg-rome-food",
    "rome",
    1,
    4,
    { he: "רומא לחובבי אוכל", en: "Rome for Foodies" },
    { he: "סדנת פסטה + סיור טעימות בטרסטוורה", en: "Pasta workshop + Trastevere tasting tour" },
    ["flight", "hotel", "breakfast", "tour"]
  ),
];

export function getPackage(id: string): VacationPackage | undefined {
  return packages.find((p) => p.id === id);
}
