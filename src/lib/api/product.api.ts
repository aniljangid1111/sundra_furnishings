import { apiClient, ApiResponse } from "./client";
import type {
  Product,
  ProductKpi,
  GetProductsParams,
  ProductPayload,
} from "@/features/products/product.types";

/**
 * Fetch all products with pagination, search, status, category, and stock filters
 */
export async function getProductsApi(
  params?: GetProductsParams
): Promise<ApiResponse<Product[]> & { kpi?: ProductKpi }> {
  return apiClient<Product[]>("api/products", {
    params,
  }) as Promise<ApiResponse<Product[]> & { kpi?: ProductKpi }>;
}

/**
 * Fetch single product by ID
 */
export async function getProductByIdApi(
  id: number | string
): Promise<ApiResponse<Product>> {
  return apiClient<Product>(`api/products/${id}`);
}

/**
 * Create a new product (supports JSON payload or multipart FormData for Cloudinary image upload)
 */
export async function createProductApi(
  data: FormData | ProductPayload
): Promise<ApiResponse<Product>> {
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;

  return apiClient<Product>("api/products", {
    method: "POST",
    body: isFormData ? data : JSON.stringify(data),
  });
}

/**
 * Update an existing product (supports JSON payload or multipart FormData)
 */
export async function updateProductApi(
  id: number | string,
  data: FormData | Partial<ProductPayload>
): Promise<ApiResponse<Product>> {
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;

  return apiClient<Product>(`api/products/${id}`, {
    method: "PUT",
    body: isFormData ? data : JSON.stringify(data),
  });
}

/**
 * Delete a product by ID
 */
export async function deleteProductApi(
  id: number | string
): Promise<ApiResponse<void>> {
  return apiClient<void>(`api/products/${id}`, {
    method: "DELETE",
  });
}
