/**
 * Users Management API Service
 * Sundara Billing & Inventory System
 */

import { apiClient, ApiResponse } from "./client";
import type { UserAccount } from "@/features/users/user.types";

export interface UserKPI {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
}

export interface GetUsersParams {
  search?: string;
  roleId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  mobile?: string;
  password?: string;
  roleId?: string;
  role?: string;
  status?: "ACTIVE" | "INACTIVE";
  avatarBg?: string;
  requirePasswordChange?: boolean;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  mobile?: string;
  roleId?: string;
  role?: string;
  status?: "ACTIVE" | "INACTIVE";
  avatarBg?: string;
  requirePasswordChange?: boolean;
}

/**
 * Fetch all users with search, role filters, and pagination
 */
export async function getUsersApi(
  params: GetUsersParams = {}
): Promise<ApiResponse<UserAccount[]> & { kpi?: UserKPI }> {
  const query = new URLSearchParams();
  if (params.search) query.append("search", params.search);
  if (params.roleId && params.roleId !== "ALL") query.append("roleId", params.roleId);
  if (params.status && params.status !== "ALL") query.append("status", params.status);
  if (params.page) query.append("page", String(params.page));
  if (params.limit) query.append("limit", String(params.limit));

  const endpoint = `api/users${query.toString() ? `?${query.toString()}` : ""}`;
  return apiClient<UserAccount[]>(endpoint, { method: "GET" }) as Promise<
    ApiResponse<UserAccount[]> & { kpi?: UserKPI }
  >;
}

/**
 * Fetch single user by ID
 */
export async function getUserByIdApi(
  id: string | number
): Promise<ApiResponse<UserAccount>> {
  return apiClient<UserAccount>(`api/users/${id}`, { method: "GET" });
}

/**
 * Create a new user account
 */
export async function createUserApi(
  payload: CreateUserPayload
): Promise<ApiResponse<UserAccount>> {
  return apiClient<UserAccount>("api/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Update an existing user account
 */
export async function updateUserApi(
  id: string | number,
  payload: UpdateUserPayload
): Promise<ApiResponse<UserAccount>> {
  return apiClient<UserAccount>(`api/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/**
 * Reset a user's password
 */
export async function resetUserPasswordApi(
  id: string | number,
  newPassword: string,
  requireChangeOnLogin = true
): Promise<ApiResponse<{ message: string }>> {
  return apiClient<{ message: string }>(`api/users/${id}/reset-password`, {
    method: "POST",
    body: JSON.stringify({ newPassword, requireChangeOnLogin }),
  });
}

/**
 * Delete a user account
 */
export async function deleteUserApi(
  id: string | number
): Promise<ApiResponse<{ message: string; id: string | number }>> {
  return apiClient<{ message: string; id: string | number }>(`api/users/${id}`, {
    method: "DELETE",
  });
}

