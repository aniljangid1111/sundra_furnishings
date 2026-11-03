/**
 * Roles & Permission Matrix API Service
 * Sundara Billing & Inventory System
 */

import { apiClient, ApiResponse } from "./client";
import type { UserRole, ModuleCRUD } from "@/features/roles/role.types";

export interface RolePayload {
  name: string;
  code?: string;
  description?: string;
  status?: "ACTIVE" | "INACTIVE";
  modules?: string[];
  permissions?: Record<string, ModuleCRUD>;
}

/**
 * Fetch all roles
 */
export async function getRolesApi(): Promise<ApiResponse<UserRole[]>> {
  return apiClient<UserRole[]>("api/roles", { method: "GET" });
}

/**
 * Fetch single role by ID
 */
export async function getRoleByIdApi(
  id: string
): Promise<ApiResponse<UserRole>> {
  return apiClient<UserRole>(`api/roles/${id}`, { method: "GET" });
}

/**
 * Create a new user role with permissions
 */
export async function createRoleApi(
  payload: RolePayload
): Promise<ApiResponse<UserRole>> {
  return apiClient<UserRole>("api/roles", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Update role metadata and permissions
 */
export async function updateRoleApi(
  id: string,
  payload: Partial<RolePayload>
): Promise<ApiResponse<UserRole>> {
  return apiClient<UserRole>(`api/roles/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/**
 * Delete a user role
 */
export async function deleteRoleApi(
  id: string
): Promise<ApiResponse<{ message: string; id: string }>> {
  return apiClient<{ message: string; id: string }>(`api/roles/${id}`, {
    method: "DELETE",
  });
}

