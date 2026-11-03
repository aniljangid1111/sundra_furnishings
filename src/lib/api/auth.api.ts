/**
 * Authentication API Service
 * Interacts with Sundara Backend Auth APIs & Next.js Session cookies
 */

import { apiClient, ApiResponse } from "./client";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UserSession {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "EMPLOYEE" | string;
  roleTitle?: string;
  roleId?: string;
  status: string;
  permissions?: Record<
    string,
    {
      canView: boolean;
      canCreate: boolean;
      canEdit: boolean;
      canDelete: boolean;
    }
  >;
}

export interface AuthLoginResponse {
  user: UserSession;
}

/**
 * 1. Calls Next.js Server Login Endpoint /api/auth/login
 * 2. Next.js communicates with Express backend, securely sets httpOnly JWT cookie
 * 3. Token NEVER touches client-side JavaScript or localStorage
 */
export async function loginUser(
  credentials: LoginCredentials
): Promise<AuthLoginResponse> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  const data = await res.json();

  if (!res.ok || !data.success || !data.user) {
    throw new Error(data.message || "Invalid email or password");
  }

  return { user: data.user };
}

/**
 * Destroys session cookies on logout
 */
export async function logoutUser(): Promise<void> {
  await fetch("/api/auth/session", {
    method: "DELETE",
  }).catch(() => {});
}

/**
 * Retrieves currently active session from cookies
 */
export async function getCurrentSession(): Promise<UserSession | null> {
  try {
    const res = await fetch("/api/auth/session", {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json?.user || null;
  } catch {
    return null;
  }
}

