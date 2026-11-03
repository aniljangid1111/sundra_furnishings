import { apiClient, ApiResponse } from "./client";
import type { Supplier, SupplierStatus, SupplierType } from "@/features/suppliers/supplier.types";

export interface SupplierKpi {
  totalSuppliers: number;
  activeSuppliers: number;
  inactiveSuppliers: number;
  totalOpeningBalance: number;
}

export interface GetSuppliersParams {
  page?: number;
  limit?: number | "all";
  search?: string;
  status?: string;
}

export interface SupplierPayload {
  supplierCode: string;
  supplierType?: SupplierType;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  taxId?: string;
  paymentTerms?: string;
  openingBalance?: number;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  notes?: string;
  status?: SupplierStatus;
}

/**
 * Fetch all suppliers with pagination, search, status filters, and KPIs
 */
export async function getSuppliersApi(
  params?: GetSuppliersParams
): Promise<ApiResponse<Supplier[]> & { kpi?: SupplierKpi }> {
  return apiClient<Supplier[]>("api/suppliers", {
    params,
  }) as Promise<ApiResponse<Supplier[]> & { kpi?: SupplierKpi }>;
}

/**
 * Fetch a single supplier by ID
 */
export async function getSupplierByIdApi(
  id: number | string
): Promise<ApiResponse<Supplier>> {
  return apiClient<Supplier>(`api/suppliers/${id}`);
}

/**
 * Create a new supplier
 */
export async function createSupplierApi(
  payload: SupplierPayload
): Promise<ApiResponse<Supplier>> {
  return apiClient<Supplier>("api/suppliers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Update an existing supplier
 */
export async function updateSupplierApi(
  id: number | string,
  payload: Partial<SupplierPayload>
): Promise<ApiResponse<Supplier>> {
  return apiClient<Supplier>(`api/suppliers/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/**
 * Delete a supplier
 */
export async function deleteSupplierApi(
  id: number | string
): Promise<ApiResponse<void>> {
  return apiClient<void>(`api/suppliers/${id}`, {
    method: "DELETE",
  });
}

