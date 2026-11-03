import { apiClient, ApiResponse } from "./client";
import type { Purchase, PurchaseStatus } from "@/features/purchases/purchase.types";

export interface PurchaseKpi {
  totalCount: number;
  totalValue: number;
  receivedCount: number;
  draftCount: number;
  orderedCount: number;
  totalBalanceDue: number;
}

export interface GetPurchasesParams {
  page?: number;
  limit?: number | "all";
  status?: string;
  supplierId?: number;
  warehouseId?: number;
  search?: string;
  timeRange?: string;
  startDate?: string;
  endDate?: string;
}

export interface PurchasePayload {
  purchaseNumber?: string;
  supplierId: number;
  supplierName?: string;
  warehouseId: number;
  warehouseName?: string;
  purchaseDate?: string;
  expectedDate?: string;
  supplierInvoiceNumber?: string;
  containerNumber?: string;
  status?: PurchaseStatus;
  items: Array<{
    productId: number;
    sku?: string;
    productName?: string;
    quantity: number;
    unitCost?: number;
    discount?: number;
    taxRate?: number;
    lineTotal?: number;
    receivedQuantity?: number;
  }>;
  subtotal?: number;
  discount?: number;
  tax?: number;
  additionalCharges?: number;
  grandTotal?: number;
  amountPaid?: number;
  balanceDue?: number;
  notes?: string;
}

export async function getPurchasesApi(
  params?: GetPurchasesParams
): Promise<ApiResponse<Purchase[]> & { kpi?: PurchaseKpi }> {
  return apiClient<Purchase[]>("api/purchases", {
    params,
  }) as Promise<ApiResponse<Purchase[]> & { kpi?: PurchaseKpi }>;
}

export async function getPurchaseByIdApi(
  id: number | string
): Promise<ApiResponse<Purchase>> {
  return apiClient<Purchase>(`api/purchases/${id}`);
}

export async function createPurchaseApi(
  payload: PurchasePayload
): Promise<ApiResponse<Purchase>> {
  return apiClient<Purchase>("api/purchases", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updatePurchaseApi(
  id: number | string,
  payload: Partial<PurchasePayload>
): Promise<ApiResponse<Purchase>> {
  return apiClient<Purchase>(`api/purchases/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deletePurchaseApi(
  id: number | string
): Promise<ApiResponse<void>> {
  return apiClient<void>(`api/purchases/${id}`, {
    method: "DELETE",
  });
}

