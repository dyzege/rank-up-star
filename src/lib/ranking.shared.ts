export const MIN_PRICE = 4000;
export const BASE_PRICE = 5000;

/** Cena towaru liczona wyłącznie po stronie serwera. */
export function computePrice(totalScore: number): number {
  const price = BASE_PRICE + (totalScore - 50) * 100;
  return Math.max(MIN_PRICE, Math.round(price));
}

export type RankingEntry = {
  id: string;
  name: string;
  role: string;
  weeklyScore: number | null;
  weekStart: string | null;
  meritPoints: number;
  totalScore: number;
  price: number;
};

export type EmployeeRow = {
  id: string;
  name: string;
  role: string;
  active: boolean;
  created_at: string;
};

export type ReviewRow = {
  id: string;
  week_start: string;
  productivity: number;
  quality: number;
  engagement: number;
  teamwork: number;
  discipline: number;
  note: string | null;
  created_at: string;
};

export type MeritRow = {
  id: string;
  points: number;
  reason: string;
  created_at: string;
};

export function formatPrice(value: number): string {
  return "$" + value.toLocaleString("en-US");
}
