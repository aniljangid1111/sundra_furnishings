import { initialInventory } from "@/features/inventory/inventory.data";
import { initialInvoices } from "@/features/invoices/invoice.data";
import { products } from "@/features/products/product.data";
import { salesChannels } from "@/features/sales-channels/sales-channel.data";

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

export const monthlyRevenueTrends: MonthlyTrendPoint[] = [
  { month: "May", revenue: 31200, cost: 14100, profit: 17100 },
  { month: "Jun", revenue: 37500, cost: 16800, profit: 20700 },
  { month: "Jul", revenue: 42100, cost: 18900, profit: 23200 },
  { month: "Aug", revenue: 36400, cost: 16200, profit: 20200 },
  { month: "Sep", revenue: 44800, cost: 19900, profit: 24900 },
  { month: "Oct", revenue: 48250, cost: 21840, profit: 26410 },
];

export const channelColors: Record<string, string> = {
  Website: "#047857", // emerald-700
  Amazon: "#f59e0b", // amber-500
  Wayfair: "#6366f1", // indigo-500
  "Retail Store": "#0ea5e9", // sky-500
};

export function getChannelBreakdown(): ChannelSharePoint[] {
  const channelData: Record<string, { value: number; orders: number }> = {
    Website: { value: 21712, orders: 12 },
    Amazon: { value: 14475, orders: 9 },
    Wayfair: { value: 9650, orders: 6 },
    "Retail Store": { value: 2413, orders: 2 },
  };

  return Object.entries(channelData).map(([name, data]) => ({
    name,
    value: data.value,
    orders: data.orders,
    color: channelColors[name] || "#94a3b8",
  }));
}

export function getCategoryBreakdown(): CategorySharePoint[] {
  return [
    { category: "Furniture", revenue: 28450, units: 72, color: "#047857", percentage: 59 },
    { category: "Bedding", revenue: 11800, units: 68, color: "#3b82f6", percentage: 24 },
    { category: "Lighting", revenue: 4800, units: 18, color: "#f59e0b", percentage: 10 },
    { category: "Home Decor", revenue: 3200, units: 55, color: "#8b5cf6", percentage: 7 },
  ];
}

export function getBestSellingProducts(): BestSellingProductItem[] {
  return [
    {
      id: 2,
      name: "Luna Accent Chair",
      sku: "CHR-001",
      category: "Furniture",
      unitsSold: 42,
      revenue: 11760,
      costPrice: 280,
      profit: 7560,
      marginPercent: 64.3,
      onHandStock: 18,
    },
    {
      id: 1,
      name: "Cotton Bedsheet Set - Queen",
      sku: "BED-001",
      category: "Bedding",
      unitsSold: 68,
      revenue: 8160,
      costPrice: 120,
      profit: 4280,
      marginPercent: 52.5,
      onHandStock: 42,
    },
    {
      id: 3,
      name: "Oak Side Table",
      sku: "TBL-001",
      category: "Furniture",
      unitsSold: 24,
      revenue: 4080,
      costPrice: 170,
      profit: 1960,
      marginPercent: 48.0,
      onHandStock: 7,
    },
    {
      id: 4,
      name: "Linen Cushion Set",
      sku: "CUS-001",
      category: "Home Decor",
      unitsSold: 55,
      revenue: 3025,
      costPrice: 55,
      profit: 1760,
      marginPercent: 58.2,
      onHandStock: 64,
    },
    {
      id: 5,
      name: "Walnut Console Table",
      sku: "TBL-002",
      category: "Furniture",
      unitsSold: 6,
      revenue: 2700,
      costPrice: 450,
      profit: 1140,
      marginPercent: 42.2,
      onHandStock: 4,
    },
  ];
}
