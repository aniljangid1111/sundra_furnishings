import { apiClient, ApiResponse } from "./client";
import type { Warehouse, WarehouseStatus } from "@/features/warehouses/warehouse.types";

export interface WarehouseKpi {
  totalWarehouses: number;
  activeWarehouses: number;
  inactiveWarehouses: number;
}

export interface GetWarehousesParams {
  page?: number;
  limit?: number | "all";
  search?: string;
  status?: string;
}

export interface WarehousePayload {
  warehouseCode: string;
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  status?: WarehouseStatus;
  notes?: string;
}

/**
 * Fetch all warehouses with search, status filter, pagination, and KPIs
 */
export async function getWarehousesApi(
  params?: GetWarehousesParams
): Promise<ApiResponse<Warehouse[]> & { kpi?: WarehouseKpi }> {
  return apiClient<Warehouse[]>("api/warehouses", {
    params,
  }) as Promise<ApiResponse<Warehouse[]> & { kpi?: WarehouseKpi }>;
}

/**
 * Fetch a single warehouse by ID
 */
export async function getWarehouseByIdApi(
  id: number | string
): Promise<ApiResponse<Warehouse>> {
  return apiClient<Warehouse>(`api/warehouses/${id}`);
}

/**
 * Create a new warehouse
 */
export async function createWarehouseApi(
  payload: WarehousePayload
): Promise<ApiResponse<Warehouse>> {
  return apiClient<Warehouse>("api/warehouses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Update an existing warehouse
 */
export async function updateWarehouseApi(
  id: number | string,
  payload: Partial<WarehousePayload>
): Promise<ApiResponse<Warehouse>> {
  return apiClient<Warehouse>(`api/warehouses/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/**
 * Delete a warehouse
 */
export async function deleteWarehouseApi(
  id: number | string
): Promise<ApiResponse<void>> {
  return apiClient<void>(`api/warehouses/${id}`, {
    method: "DELETE",
  });
}

