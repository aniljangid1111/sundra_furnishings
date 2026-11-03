/**
 * Insights & Analytics API Service
 * Sundara Billing & Inventory System
 */

import { apiClient, ApiResponse } from "./client";

export interface DashboardInsights {
  kpi: {
    totalSales: number;
    totalPaid: number;
    outstandingAmount: number;
    totalCostOfGoodsSold: number;
    grossProfit: number;
    profitMarginPercent: number;
    inventoryValue: number;
    totalProducts: number;
    totalInvoices: number;
    totalPurchases: number;
    totalPurchasesCost: number;
  };
  monthlyTrends: Array<{
    month: string;
    revenue: number;
    cost: number;
    profit: number;
  }>;
  channelBreakdown: Array<{
    name: string;
    value: number;
    orders: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    revenue: number;
    units: number;
    percentage: number;
  }>;
  bestSellingProducts: Array<{
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
  }>;
}

export interface FinancialReportData {
  reportType: string;
  dateRange: {
    startDate?: string;
    endDate?: string;
    timeRange?: string;
  };
  kpi: Record<string, number>;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  rows: any[];
}

/**
 * Fetch executive dashboard business metrics and trends
 */
export async function getDashboardInsightsApi(params?: {
  timeRange?: string;
  startDate?: string;
  endDate?: string;
}): Promise<ApiResponse<DashboardInsights>> {
  const query = new URLSearchParams();
  if (params?.timeRange && params.timeRange !== "ALL") query.append("timeRange", params.timeRange);
  if (params?.startDate) query.append("startDate", params.startDate);
  if (params?.endDate) query.append("endDate", params.endDate);

  const endpoint = `api/insights${query.toString() ? `?${query.toString()}` : ""}`;
  return apiClient<DashboardInsights>(endpoint, { method: "GET" });
}

/**
 * Fetch structured business report (sales, purchases, profit-loss, inventory, tax)
 */
export async function getReportApi(
  type: string,
  params?: {
    timeRange?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }
): Promise<ApiResponse<FinancialReportData>> {
  const query = new URLSearchParams();
  if (params?.timeRange && params.timeRange !== "ALL") query.append("timeRange", params.timeRange);
  if (params?.startDate) query.append("startDate", params.startDate);
  if (params?.endDate) query.append("endDate", params.endDate);
  if (params?.page) query.append("page", String(params.page));
  if (params?.limit) query.append("limit", String(params.limit));

  const endpoint = `api/reports/${type}${query.toString() ? `?${query.toString()}` : ""}`;
  return apiClient<FinancialReportData>(endpoint, { method: "GET" });
}
