import { apiClient, ApiResponse } from "./client";
import type { Category, CategoryStatus } from "@/features/categories/category.types";

export interface CategoryKpi {
  totalCategories: number;
  activeCategories: number;
  inactiveCategories: number;
  totalProductCount: number;
}

export interface GetCategoriesParams {
  page?: number;
  limit?: number | "all";
  search?: string;
  status?: string;
}

export interface CategoryPayload {
  name: string;
  code: string;
  description?: string;
  status?: CategoryStatus;
}

/**
 * Fetch all categories with pagination, search, status filters, and KPIs
 */
export async function getCategoriesApi(
  params?: GetCategoriesParams
): Promise<ApiResponse<Category[]>> {
  return apiClient<Category[]>("api/categories", {
    params,
  });
}

/**
 * Fetch single category by ID
 */
export async function getCategoryByIdApi(
  id: number | string
): Promise<ApiResponse<Category>> {
  return apiClient<Category>(`api/categories/${id}`);
}

/**
 * Create a new category
 */
export async function createCategoryApi(
  payload: CategoryPayload
): Promise<ApiResponse<Category>> {
  return apiClient<Category>("api/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Update an existing category
 */
export async function updateCategoryApi(
  id: number | string,
  payload: Partial<CategoryPayload>
): Promise<ApiResponse<Category>> {
  return apiClient<Category>(`api/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/**
 * Delete a category
 */
export async function deleteCategoryApi(
  id: number | string
): Promise<ApiResponse<void>> {
  return apiClient<void>(`api/categories/${id}`, {
    method: "DELETE",
  });
}

