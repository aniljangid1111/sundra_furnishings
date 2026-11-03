import { apiClient, ApiResponse } from "./client";
import type {
  SalesChannel,
  SalesChannelStatus,
  SalesChannelType,
} from "@/features/sales-channels/sales-channel.types";

export interface SalesChannelKpi {
  totalChannels: number;
  activeChannels: number;
  inactiveChannels: number;
  marketplaceCount: number;
  retailCount: number;
}

export interface GetSalesChannelsParams {
  page?: number;
  limit?: number | "all";
  search?: string;
  status?: string;
  type?: string;
}

export interface SalesChannelPayload {
  name: string;
  code?: string;
  type?: SalesChannelType;
  website?: string;
  description?: string;
  status?: SalesChannelStatus;
}

/**
 * Fetch all sales channels with pagination, search, status filters, and KPIs
 */
export async function getSalesChannelsApi(
  params?: GetSalesChannelsParams
): Promise<ApiResponse<SalesChannel[]> & { kpi?: SalesChannelKpi }> {
  return apiClient<SalesChannel[]>("api/sales-channels", {
    params,
  }) as Promise<ApiResponse<SalesChannel[]> & { kpi?: SalesChannelKpi }>;
}

/**
 * Fetch a single sales channel by ID
 */
export async function getSalesChannelByIdApi(
  id: number | string
): Promise<ApiResponse<SalesChannel>> {
  return apiClient<SalesChannel>(`api/sales-channels/${id}`);
}

/**
 * Create a new sales channel (Admin only)
 */
export async function createSalesChannelApi(
  payload: SalesChannelPayload
): Promise<ApiResponse<SalesChannel>> {
  return apiClient<SalesChannel>("api/sales-channels", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Update an existing sales channel (Admin only)
 */
export async function updateSalesChannelApi(
  id: number | string,
  payload: Partial<SalesChannelPayload>
): Promise<ApiResponse<SalesChannel>> {
  return apiClient<SalesChannel>(`api/sales-channels/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/**
 * Delete a sales channel (Admin only)
 */
export async function deleteSalesChannelApi(
  id: number | string
): Promise<ApiResponse<void>> {
  return apiClient<void>(`api/sales-channels/${id}`, {
    method: "DELETE",
  });
}

