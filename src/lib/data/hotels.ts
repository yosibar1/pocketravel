import type { Hotel, LocalizedText } from "@/lib/types";
import { destinations } from "./destinations";

interface HotelTemplate {
  name: LocalizedText;
  stars: number;
  priceFactor: number;
  amenities: string[];
}

const templates: HotelTemplate[] = [
  {
    name: { he: "מלון גרנד פאלאס", en: "Grand Palace Hotel" },
    stars: 5,
    priceFactor: 2.2,
    amenities: ["pool", "spa", "breakfast", "gym", "wifi"],
  },
  {
    name: { he: "בוטיק סנטרל", en: "Central Boutique" },
    stars: 4,
    priceFactor: 1.4,
    amenities: ["breakfast", "wifi", "gym"],
  },
  {
    name: { he: "סיטי אין", en: "City Inn" },
    stars: 3,
    priceFactor: 0.9,
    amenities: ["wifi", "parking"],
  },
  {
    name: { he: "ריביירה ריזורט", en: "Riviera Resort" },
    stars: 5,
    priceFactor: 1.9,
    amenities: ["pool", "beach", "breakfast", "spa", "family", "wifi"],
  },
  {
    name: { he: "אורבן לופט", en: "Urban Loft" },
    stars: 4,
    priceFactor: 1.2,
    amenities: ["wifi", "gym", "parking"],
  },
  {
    name: { he: "קן הנוסע", en: "Traveler's Nest" },
    stars: 3,
    priceFactor: 0.7,
    amenities: ["wifi", "breakfast", "family"],
  },
];

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

function buildHotels(): Hotel[] {
  const hotels: Hotel[] = [];
  for (const dest of destinations) {
    const rand = seeded(dest.id);
    const basePrice = 60 + Math.floor((dest.avgFlightPriceUSD / 900) * 120);
    templates.forEach((t, i) => {
      const cityName = dest.city;
      hotels.push({
        id: `${dest.id}-h${i}`,
        destinationId: dest.id,
        name: {
          he: `${t.name.he} ${cityName.he}`,
          en: `${t.name.en} ${cityName.en}`,
        },
        stars: t.stars,
        rating: Math.round((6.8 + rand() * 2.9) * 10) / 10,
        reviewCount: 120 + Math.floor(rand() * 4200),
        pricePerNightUSD: Math.round(basePrice * t.priceFactor * (0.85 + rand() * 0.4)),
        image: dest.image,
        amenities: t.amenities,
        distanceFromCenterKm: Math.round(rand() * 60) / 10,
      });
    });
  }
  return hotels;
}

export const hotels: Hotel[] = buildHotels();

export function getHotelsForDestination(destinationId: string): Hotel[] {
  return hotels.filter((h) => h.destinationId === destinationId);
}

export function getHotel(id: string): Hotel | undefined {
  return hotels.find((h) => h.id === id);
}
