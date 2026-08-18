import type { ItineraryDay, ItineraryPlan, Lang } from "@/lib/types";
import { getDestination } from "@/lib/data/destinations";
import { getHotelsForDestination } from "@/lib/data/hotels";
import { lt } from "@/lib/i18n";

export interface PlannerRequest {
  destinationId: string;
  days: number;
  budgetUSD: number;
  style: "relaxed" | "balanced" | "packed";
  interests: string[];
  freeText?: string;
  lang: Lang;
}

const texts = {
  he: {
    morning: "בוקר",
    arrivalTitle: "הגעה והתמקמות",
    arrival: "נחיתה, העברה למלון וצ'ק אין",
    arrivalDesc: "התמקמות במלון, מקלחת מרעננת וסיבוב היכרות ראשון בסביבה.",
    dinnerNear: "ארוחת ערב במסעדה מקומית ליד המלון",
    dinnerNearDesc: "טעימה ראשונה מהמטבח המקומי — בקשו המלצה בקבלה.",
    breakfast: "ארוחת בוקר",
    breakfastDesc: "פתיחה רגועה ליום עם קפה טוב.",
    lunchLocal: "צהריים במסעדה מקומית",
    lunchLocalDesc: "הפסקה טעימה בין האטרקציות.",
    freeAfternoon: "אחר צהריים חופשי",
    freeAfternoonDesc: "זמן לשופינג, בית קפה או מנוחה במלון.",
    poolTime: "זמן בריכה ומנוחה",
    poolTimeDesc: "טעינת מצברים לפני הערב.",
    eveningStroll: "טיול ערב ואווירה מקומית",
    eveningStrollDesc: "שוטטות ברחובות, גלידה ואווירת ערב.",
    departureTitle: "יום אחרון ופרידה",
    lastMorning: "בוקר אחרון — קניות אחרונות ומזכרות",
    lastMorningDesc: "עוד סיבוב קטן במקומות שאהבתם.",
    checkout: "צ'ק אאוט ונסיעה לשדה התעופה",
    checkoutDesc: "מומלץ לצאת 3 שעות לפני הטיסה.",
    dayTitle: (n: number) => `יום ${n}`,
    summary: (city: string, days: number) =>
      `${days} ימים של חוויות ב${city} — תוכנית מאוזנת עם הדגשים שביקשתם.`,
    tipBudget: "הזמינו כרטיסים לאטרקציות מראש באינטרנט — לרוב זול יותר וחוסך תורים.",
    tipCash: "החזיקו קצת מזומן מקומי לשווקים ולטיפים.",
    tipTransit: "בדקו כרטיס תחבורה ציבורית יומי/שבועי — כמעט תמיד משתלם.",
    tipWater: "בקבוק מים רב-פעמי חוסך כסף ופלסטיק.",
    visit: "ביקור: ",
  },
  en: {
    morning: "Morning",
    arrivalTitle: "Arrival & settling in",
    arrival: "Landing, transfer to hotel and check-in",
    arrivalDesc: "Settle into the hotel, freshen up and take a first walk around the area.",
    dinnerNear: "Dinner at a local restaurant near the hotel",
    dinnerNearDesc: "A first taste of the local cuisine — ask reception for a tip.",
    breakfast: "Breakfast",
    breakfastDesc: "An easy start to the day with good coffee.",
    lunchLocal: "Lunch at a local spot",
    lunchLocalDesc: "A tasty break between sights.",
    freeAfternoon: "Free afternoon",
    freeAfternoonDesc: "Time for shopping, a café or a rest at the hotel.",
    poolTime: "Pool & downtime",
    poolTimeDesc: "Recharge before the evening.",
    eveningStroll: "Evening stroll & local vibes",
    eveningStrollDesc: "Wander the streets, grab a gelato and soak up the evening.",
    departureTitle: "Last day & farewell",
    lastMorning: "Last morning — final shopping and souvenirs",
    lastMorningDesc: "One more loop through your favorite spots.",
    checkout: "Check-out and ride to the airport",
    checkoutDesc: "Leave about 3 hours before your flight.",
    dayTitle: (n: number) => `Day ${n}`,
    summary: (city: string, days: number) =>
      `${days} days of experiences in ${city} — a balanced plan with your priorities in mind.`,
    tipBudget: "Book attraction tickets online in advance — usually cheaper and skips the lines.",
    tipCash: "Keep some local cash for markets and tips.",
    tipTransit: "Check for a daily/weekly transit pass — it almost always pays off.",
    tipWater: "A reusable water bottle saves money and plastic.",
    visit: "Visit: ",
  },
};

// Rule-based fallback itinerary generator. Used when no Claude API key is
// configured; produces a sensible plan from the demo destination data.
export function buildRulePlan(req: PlannerRequest): ItineraryPlan {
  const dest = getDestination(req.destinationId);
  const t = texts[req.lang];
  if (!dest) {
    throw new Error("Unknown destination");
  }
  const city = lt(dest.city, req.lang);
  const activities = dest.activities.map((a) => lt(a, req.lang));
  const perDay = req.style === "packed" ? 2 : req.style === "relaxed" ? 1 : 1.5;

  const days: ItineraryDay[] = [];
  let actIdx = 0;

  for (let d = 1; d <= req.days; d++) {
    const isFirst = d === 1;
    const isLast = d === req.days && req.days > 1;
    const day: ItineraryDay = {
      day: d,
      title: isFirst ? t.arrivalTitle : isLast ? t.departureTitle : t.dayTitle(d),
      activities: [],
    };

    if (isFirst) {
      day.activities.push(
        { time: "14:00", title: t.arrival, description: t.arrivalDesc, category: "transit" },
        { time: "17:00", title: t.eveningStroll, description: t.eveningStrollDesc, category: "activity" },
        { time: "20:00", title: t.dinnerNear, description: t.dinnerNearDesc, category: "food" }
      );
    } else if (isLast) {
      day.activities.push(
        { time: "08:30", title: t.breakfast, description: t.breakfastDesc, category: "food" },
        { time: "10:00", title: t.lastMorning, description: t.lastMorningDesc, category: "activity" },
        { time: "13:00", title: t.checkout, description: t.checkoutDesc, category: "transit" }
      );
    } else {
      day.activities.push({
        time: "08:30",
        title: t.breakfast,
        description: t.breakfastDesc,
        category: "food",
      });
      const morningActivity = activities[actIdx % activities.length];
      actIdx++;
      day.title = morningActivity;
      day.activities.push({
        time: "10:00",
        title: `${t.visit}${morningActivity}`,
        description: lt(dest.description, req.lang),
        category: "sight",
      });
      day.activities.push({
        time: "13:30",
        title: t.lunchLocal,
        description: t.lunchLocalDesc,
        category: "food",
      });
      if (perDay >= 1.5 && actIdx < activities.length + 10) {
        const afternoon = activities[actIdx % activities.length];
        actIdx++;
        day.activities.push({
          time: "15:30",
          title: `${t.visit}${afternoon}`,
          description: "",
          category: "sight",
        });
      } else {
        day.activities.push({
          time: "15:30",
          title: req.style === "relaxed" ? t.poolTime : t.freeAfternoon,
          description: req.style === "relaxed" ? t.poolTimeDesc : t.freeAfternoonDesc,
          category: "rest",
        });
      }
      day.activities.push({
        time: "19:30",
        title: t.dinnerNear,
        description: t.dinnerNearDesc,
        category: "food",
      });
    }
    days.push(day);
  }

  const hotel = getHotelsForDestination(req.destinationId).sort(
    (a, b) => a.pricePerNightUSD - b.pricePerNightUSD
  )[0];
  const estimated = Math.round(
    dest.avgFlightPriceUSD +
      (hotel?.pricePerNightUSD ?? 90) * Math.max(req.days - 1, 1) * 0.5 +
      req.days * (req.style === "packed" ? 90 : 60)
  );

  return {
    destination: city,
    summary: t.summary(city, req.days),
    days,
    estimatedBudgetUSD: Math.min(estimated, req.budgetUSD || estimated),
    tips: [t.tipBudget, t.tipCash, t.tipTransit, t.tipWater],
    source: "rules",
  };
}
