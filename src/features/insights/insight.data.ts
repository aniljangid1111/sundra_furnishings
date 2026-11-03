export interface MonthlyTrendPoint {
  month: string;
  revenue: number;
  cost: number;
  profit: number;
}

export interface ChannelSharePoint {
  name: string;
  value: number;
  orders: number;
  color: string;
}

export interface CategorySharePoint {
  category: string;
  revenue: number;
  units: number;
  color: string;
  percentage: number;
}

export interface BestSellingProductItem {
  id: number;
  name: string;
  sku: string;
  category: string;
  unitsSold: number;
  revenue: number;
  costPrice: number;
  profit: number;
  marginPercent: number;
  onHandStock: number;
}

export const monthlyRevenueTrends: MonthlyTrendPoint[] = [];

export const channelColors: Record<string, string> = {
  Website: "#047857",
  Amazon: "#f59e0b",
  Wayfair: "#6366f1",
  "Retail Store": "#0ea5e9",
};

export function getChannelBreakdown(): ChannelSharePoint[] {
  return [];
}

export function getCategoryBreakdown(): CategorySharePoint[] {
  return [];
}

export function getBestSellingProducts(): BestSellingProductItem[] {
  return [];
}
