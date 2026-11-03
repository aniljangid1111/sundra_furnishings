/**
 * Inventory & Stock Ledger API Service
 * Sundara Billing & Inventory System
 */

import { apiClient, ApiResponse } from "./client";
import type { InventoryItem, StockLedgerEntry, StockStatus } from "@/features/inventory/inventory.types";

export interface InventoryKPI {
  totalUnits: number;
  totalValuation: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export interface InventoryQueryParams {
  warehouseId?: number | string;
  categoryId?: number | string;
  status?: string;
  stockStatus?: StockStatus | string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface StockAdjustmentPayload {
  productId: number;
  warehouseId: number;
  action: "ADD" | "DEDUCT" | "SET";
  quantity: number;
  reason: string;
  referenceDocument?: string;
}

export interface LedgerQueryParams {
  productId?: number | string;
  warehouseId?: number | string;
  movementType?: string;
  search?: string;
  timeRange?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

/**
 * Fetch inventory summary with KPI metrics and pagination
 */
export async function getInventoryApi(
  params: InventoryQueryParams = {}
): Promise<ApiResponse<InventoryItem[]> & { kpi?: InventoryKPI }> {
  const query = new URLSearchParams();
  if (params.warehouseId) query.append("warehouseId", String(params.warehouseId));
  if (params.categoryId) query.append("categoryId", String(params.categoryId));
  if (params.status) query.append("status", params.status);
  if (params.stockStatus && params.stockStatus !== "ALL") query.append("stockStatus", params.stockStatus);
  if (params.search) query.append("search", params.search);
  if (params.page) query.append("page", String(params.page));
  if (params.limit) query.append("limit", String(params.limit));

  const endpoint = `api/inventory${query.toString() ? `?${query.toString()}` : ""}`;
  return apiClient<InventoryItem[]>(endpoint, { method: "GET" }) as Promise<
    ApiResponse<InventoryItem[]> & { kpi?: InventoryKPI }
  >;
}

/**
 * Fetch low-stock and out-of-stock items requiring replenishment
 */
export async function getInventoryAlertsApi(): Promise<ApiResponse<InventoryItem[]>> {
  return apiClient<InventoryItem[]>("api/inventory/alerts", { method: "GET" });
}

/**
 * Fetch audit stock ledger history
 */
export async function getStockLedgerApi(
  params: LedgerQueryParams = {}
): Promise<ApiResponse<StockLedgerEntry[]>> {
  const query = new URLSearchParams();
  if (params.productId) query.append("productId", String(params.productId));
  if (params.warehouseId) query.append("warehouseId", String(params.warehouseId));
  if (params.movementType && params.movementType !== "ALL") query.append("movementType", params.movementType);
  if (params.search) query.append("search", params.search);
  if (params.timeRange) query.append("timeRange", params.timeRange);
  if (params.startDate) query.append("startDate", params.startDate);
  if (params.endDate) query.append("endDate", params.endDate);
  if (params.page) query.append("page", String(params.page));
  if (params.limit) query.append("limit", String(params.limit));

  const endpoint = `api/inventory/ledger${query.toString() ? `?${query.toString()}` : ""}`;
  return apiClient<StockLedgerEntry[]>(endpoint, { method: "GET" });
}

/**
 * Submit manual stock adjustment
 */
export async function adjustStockApi(
  payload: StockAdjustmentPayload
): Promise<ApiResponse<{ id: number; newBalance: number }>> {
  return apiClient<{ id: number; newBalance: number }>("api/inventory/adjustments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
