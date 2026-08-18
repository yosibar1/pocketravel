export type Lang = "he" | "en";

export interface LocalizedText {
  he: string;
  en: string;
}

export interface Destination {
  id: string;
  city: LocalizedText;
  country: LocalizedText;
  airportCode: string;
  image: string;
  tags: string[]; // beach | city | nature | culture | family | romantic | ski
  avgFlightPriceUSD: number;
  description: LocalizedText;
  activities: LocalizedText[];
}

export interface Flight {
  id: string;
  airline: LocalizedText;
  airlineCode: string;
  from: string; // airport code
  to: string; // airport code
  departTime: string; // HH:mm
  arriveTime: string; // HH:mm
  durationMinutes: number;
  stops: number;
  stopCity?: LocalizedText;
  priceUSD: number;
  cabin: "economy" | "business";
  date: string; // YYYY-MM-DD
}

export interface Hotel {
  id: string;
  destinationId: string;
  name: LocalizedText;
  stars: number;
  rating: number; // 0-10 guest score
  reviewCount: number;
  pricePerNightUSD: number;
  image: string;
  amenities: string[]; // pool | wifi | breakfast | spa | gym | beach | parking | family
  distanceFromCenterKm: number;
}

export interface VacationPackage {
  id: string;
  destinationId: string;
  title: LocalizedText;
  nights: number;
  pricePerPersonUSD: number;
  hotelId: string;
  includes: string[]; // flight | hotel | breakfast | transfer | tour | car
  highlight: LocalizedText;
}

export interface ItineraryActivity {
  time: string;
  title: string;
  description: string;
  category: "food" | "sight" | "activity" | "transit" | "rest";
}

export interface ItineraryDay {
  day: number;
  title: string;
  activities: ItineraryActivity[];
}

export interface ItineraryPlan {
  destination: string;
  summary: string;
  days: ItineraryDay[];
  estimatedBudgetUSD: number;
  tips: string[];
  source: "ai" | "rules";
}

export interface FlightSearchParams {
  from: string;
  to: string;
  departDate: string;
  returnDate?: string;
  passengers: number;
}

export interface HotelSearchParams {
  destinationId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}
