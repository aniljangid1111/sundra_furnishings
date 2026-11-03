/**
 * Import Shipments & Landed Cost API Service
 * Sundara Billing & Inventory System
 */

import { apiClient, ApiResponse } from "./client";
import type {
  ImportShipment,
  ImportStatus,
  ImportExpenseHead,
  ImportItem,
} from "@/features/imports/import.types";

export interface ImportKPI {
  totalImports: number;
  completedCount: number;
  processingCount: number;
  totalLandedCost: number;
}

export interface GetImportsParams {
  status?: ImportStatus | string;
  search?: string;
  supplierId?: number | string;
  warehouseId?: number | string;
  page?: number;
  limit?: number;
}

export interface ImportPayload {
  importNumber?: string;
  supplierId?: number | null;
  supplierName?: string | null;
  supplierInvoiceNumber?: string | null;
  purchaseId?: number | null;
  purchaseNumber?: string | null;
  shipmentReference?: string | null;
  importDate?: string;
  warehouseId?: number;
  warehouseName?: string;
  status?: ImportStatus;
  items: Array<{
    id?: number | string;
    productId: number;
    sku?: string;
    productName?: string;
    quantity: number;
    purchaseUnitCost: number;
    purchaseTotalCost?: number;
    allocatedExpense?: number;
    totalLandedCost?: number;
    landedUnitCost?: number;
  }>;
  expenseHeads: Array<{
    id?: number | string;
    type: string;
    description: string;
    amount: number;
    allocationMethod: string;
  }>;
  totalProductCost?: number;
  totalAdditionalCosts?: number;
  totalLandedCost?: number;
  notes?: string;
}

/**
 * Fetch import shipments with filters and pagination
 */
export async function getImportsApi(
  params: GetImportsParams = {}
): Promise<ApiResponse<ImportShipment[]> & { kpi?: ImportKPI }> {
  const query = new URLSearchParams();
  if (params.status && params.status !== "ALL") query.append("status", params.status);
  if (params.search) query.append("search", params.search);
  if (params.supplierId) query.append("supplierId", String(params.supplierId));
  if (params.warehouseId) query.append("warehouseId", String(params.warehouseId));
  if (params.page) query.append("page", String(params.page));
  if (params.limit) query.append("limit", String(params.limit));

  const endpoint = `api/imports${query.toString() ? `?${query.toString()}` : ""}`;
  return apiClient<ImportShipment[]>(endpoint, { method: "GET" }) as Promise<
    ApiResponse<ImportShipment[]> & { kpi?: ImportKPI }
  >;
}

/**
 * Fetch single import shipment by ID
 */
export async function getImportByIdApi(
  id: string | number
): Promise<ApiResponse<ImportShipment>> {
  return apiClient<ImportShipment>(`api/imports/${id}`, { method: "GET" });
}

/**
 * Create a new import shipment with landed cost calculations
 */
export async function createImportApi(
  payload: ImportPayload
): Promise<ApiResponse<ImportShipment>> {
  return apiClient<ImportShipment>("api/imports", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Update an existing import shipment
 */
export async function updateImportApi(
  id: string | number,
  payload: Partial<ImportPayload>
): Promise<ApiResponse<ImportShipment>> {
  return apiClient<ImportShipment>(`api/imports/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/**
 * Delete an import shipment
 */
export async function deleteImportApi(
  id: string | number
): Promise<ApiResponse<{ id: number; message: string }>> {
  return apiClient<{ id: number; message: string }>(`api/imports/${id}`, {
    method: "DELETE",
  });
}

