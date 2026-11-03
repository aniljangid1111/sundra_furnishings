/**
 * Business Settings API Service
 * Sundara Billing & Inventory System
 */

import { apiClient, ApiResponse } from "./client";

export interface SystemSettings {
  id: number;
  companyName: string;
  tagline?: string;
  taxId?: string;
  email: string;
  phone: string;
  website?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  defaultTaxRate: number;
  currency: string;
  logoUrl?: string;
  invoiceTerms?: string;
  quotationTerms?: string;
  updatedAt?: string;
}

/**
 * Fetch company settings and letterhead profile
 */
export async function getSettingsApi(): Promise<ApiResponse<SystemSettings>> {
  return apiClient<SystemSettings>("api/settings", { method: "GET" });
}

/**
 * Update business settings
 */
export async function updateSettingsApi(
  payload: Partial<SystemSettings>
): Promise<ApiResponse<SystemSettings>> {
  return apiClient<SystemSettings>("api/settings", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

