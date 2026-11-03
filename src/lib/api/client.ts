/**
 * Sundara Billing API Client
 * Enterprise HTTP Client with automatic request deduplication,
 * credential handling, and centralized error parsing.
 */

const BACKEND_DIRECT_URL =
  process.env.BACKEND_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

// In-flight request cache to prevent duplicate API calls on simultaneous renders
const inFlightRequests = new Map<string, Promise<any>>();

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  kpi?: Record<string, any>;
}

export interface ApiRequestOptions extends RequestInit {
  params?: Record<string, any>;
  skipDeduplication?: boolean;
}

/**
 * Normalizes endpoint into a clean subpath without leading slash or 'api/'
 */
function normalizeEndpoint(endpoint: string): string {
  let clean = endpoint.trim();
  if (clean.startsWith("/")) clean = clean.substring(1);
  if (clean.startsWith("api/")) clean = clean.substring(4);
  return clean;
}

/**
 * Builds full URL with optional query string parameters.
 * In browser: calls Next.js proxy route `/api/proxy/...` which auto-injects httpOnly JWT token.
 * On server: calls backend directly.
 */
function buildUrl(endpoint: string, params?: Record<string, any>): string {
  const clean = normalizeEndpoint(endpoint);
  const isBrowser = typeof window !== "undefined";

  let base = isBrowser
    ? `${window.location.origin}/api/proxy/${clean}`
    : `${BACKEND_DIRECT_URL}/api/${clean}`;

  const url = new URL(base);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return url.toString();
}

/**
 * Core API request method with deduplication for GET requests
 */
export async function apiClient<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const { params, skipDeduplication, headers, ...restOptions } = options;
  const fullUrl = buildUrl(endpoint, params);
  const method = (restOptions.method || "GET").toUpperCase();

  // Deduplicate identical GET requests currently pending
  if (method === "GET" && !skipDeduplication) {
    if (inFlightRequests.has(fullUrl)) {
      return inFlightRequests.get(fullUrl)!;
    }
  }

  const fetchPromise = (async () => {
    try {
      const isFormData = typeof FormData !== "undefined" && restOptions.body instanceof FormData;
      const defaultHeaders: Record<string, string> = isFormData
        ? {}
        : { "Content-Type": "application/json" };

      const response = await fetch(fullUrl, {
        ...restOptions,
        method,
        headers: {
          ...defaultHeaders,
          ...headers,
        },
        credentials: "include",
      });

      const data = await response.json().catch(() => ({
        success: false,
        message: "Failed to parse JSON response from server.",
      }));

      if (!response.ok) {
        const errorMessage =
          data?.message ||
          (data?.errors && Array.isArray(data.errors)
            ? data.errors.map((e: any) => e.message).join(", ")
            : `API request failed with status ${response.status}`);

        const error = new Error(errorMessage) as any;
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data as ApiResponse<T>;
    } finally {
      if (method === "GET") {
        inFlightRequests.delete(fullUrl);
      }
    }
  })();

  if (method === "GET" && !skipDeduplication) {
    inFlightRequests.set(fullUrl, fetchPromise);
  }

  return fetchPromise;
}

