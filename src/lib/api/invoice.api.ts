/**
 * Invoice API Service
 * Sundara Billing & Inventory System
 */

import { apiClient, ApiResponse } from "./client";
import type { Invoice, InvoicePaymentStatus, InvoiceStatus } from "@/features/invoices/invoice.types";

export interface InvoiceKPI {
  totalInvoices?: number;
  totalCount?: number;
  totalRevenue?: number;
  totalValue?: number;
  paidAmount?: number;
  totalPaid?: number;
  pendingAmount?: number;
  totalPending?: number;
  overdueAmount?: number;
  totalOverdue?: number;
}

export interface GetInvoicesParams {
  status?: InvoiceStatus | string;
  paymentStatus?: InvoicePaymentStatus | string;
  salesChannel?: string;
  search?: string;
  timeRange?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface InvoicePayload {
  invoiceNumber?: string;
  invoiceDate?: string;
  dueDate?: string;
  salesChannelId?: number;
  salesChannelName?: string;
  externalOrderId?: string;
  quotationId?: number;
  customerId?: number;
  buyerName: string;
  buyerEmail?: string;
  buyerPhone?: string;
  billingAddress?: string;
  shippingAddress?: string;
  warehouseId?: number | null;
  warehouseName?: string;
  items: Array<{
    id?: number | string;
    productId: number;
    sku?: string;
    productName?: string;
    quantity: number;
    unitPrice?: number;
    discount?: number;
    taxRate?: number;
    lineTotal?: number;
  }>;
  subtotal?: number;
  discountTotal?: number;
  taxTotal?: number;
  shippingCharges?: number;
  additionalCharges?: number;
  grandTotal?: number;
  amountPaid?: number;
  balanceDue?: number;
  paymentStatus?: InvoicePaymentStatus;
  paymentMethod?: string;
  status?: InvoiceStatus;
  notes?: string;
  termsAndConditions?: string;
}

/**
 * Fetch list of invoices with filters, search, and pagination
 */
export async function getInvoicesApi(
  params: GetInvoicesParams = {}
): Promise<ApiResponse<Invoice[]> & { kpi?: InvoiceKPI }> {
  const query = new URLSearchParams();
  if (params.status && params.status !== "ALL") query.append("status", params.status);
  if (params.paymentStatus && params.paymentStatus !== "ALL") query.append("paymentStatus", params.paymentStatus);
  if (params.salesChannel && params.salesChannel !== "ALL") query.append("salesChannel", params.salesChannel);
  if (params.search) query.append("search", params.search);
  if (params.timeRange) query.append("timeRange", params.timeRange);
  if (params.startDate) query.append("startDate", params.startDate);
  if (params.endDate) query.append("endDate", params.endDate);
  if (params.page) query.append("page", String(params.page));
  if (params.limit) query.append("limit", String(params.limit));

  const endpoint = `api/invoices${query.toString() ? `?${query.toString()}` : ""}`;
  return apiClient<Invoice[]>(endpoint, { method: "GET" }) as Promise<
    ApiResponse<Invoice[]> & { kpi?: InvoiceKPI }
  >;
}

/**
 * Fetch single invoice by ID
 */
export async function getInvoiceByIdApi(
  id: string | number
): Promise<ApiResponse<Invoice>> {
  return apiClient<Invoice>(`api/invoices/${id}`, { method: "GET" });
}

/**
 * Create a new sales invoice
 */
export async function createInvoiceApi(
  payload: InvoicePayload
): Promise<ApiResponse<Invoice>> {
  return apiClient<Invoice>("api/invoices", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Update an existing sales invoice
 */
export async function updateInvoiceApi(
  id: string | number,
  payload: Partial<InvoicePayload>
): Promise<ApiResponse<Invoice>> {
  return apiClient<Invoice>(`api/invoices/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/**
 * Delete a sales invoice
 */
export async function deleteInvoiceApi(
  id: string | number
): Promise<ApiResponse<{ id: number; message: string }>> {
  return apiClient<{ id: number; message: string }>(`api/invoices/${id}`, {
    method: "DELETE",
  });
}

