import React from "react";
import type { UserSession } from "../api/auth.api";

export type SystemModule =
  | "dashboard"
  | "invoices"
  | "purchases"
  | "inventory"
  | "imports"
  | "products"
  | "categories"
  | "salesChannels"
  | "suppliers"
  | "warehouses"
  | "users"
  | "roles"
  | "reports"
  | "settings"
  | "insights";

export type PermissionAction =
  | "canView"
  | "canCreate"
  | "canEdit"
  | "canDelete"
  | "view"
  | "create"
  | "edit"
  | "delete";

export function normalizeAction(
  action: PermissionAction
): "canView" | "canCreate" | "canEdit" | "canDelete" {
  if (action === "view") return "canView";
  if (action === "create") return "canCreate";
  if (action === "edit") return "canEdit";
  if (action === "delete") return "canDelete";
  return action;
}

/**
 * Checks if user is an Administrator (Full System Access)
 */
export function isAdmin(user: UserSession | null | undefined): boolean {
  if (!user) return false;
  const roleStr = String(user.role || "").toUpperCase();
  const roleTitleStr = String(user.roleTitle || "").toUpperCase();
  const roleIdStr = String(user.roleId || "").toLowerCase();

  return (
    roleStr === "ADMIN" ||
    roleStr === "ADMINISTRATOR" ||
    roleTitleStr === "ADMINISTRATOR" ||
    roleTitleStr === "ADMIN" ||
    roleIdStr === "role-admin"
  );
}

/**
 * Checks whether a given user has permission for a specific module action.
 * Administrators always have full permissions (bypass).
 */
export function hasPermission(
  user: UserSession | null | undefined,
  module: SystemModule,
  action: PermissionAction = "canView"
): boolean {
  if (!user) return false;

  // 1. Full Admin Bypass: Admins have unrestricted access across all modules
  if (isAdmin(user)) {
    return true;
  }

  // 2. Check granular permission matrix
  const modulePerms = user.permissions?.[module];
  if (!modulePerms) {
    return false;
  }

  const normalized = normalizeAction(action);
  return Boolean(modulePerms[normalized]);
}

/**
 * Checks if user is allowed to access a given URL path
 */
export function canAccessPath(
  user: UserSession | null | undefined,
  pathname: string
): boolean {
  // If user is not yet loaded (e.g. during SSR or initial mount), keep visible to prevent hydration flicker
  if (!user) return true;
  if (isAdmin(user)) return true;

  if (pathname.startsWith("/users") || pathname.startsWith("/roles") || pathname.startsWith("/settings")) {
    return isAdmin(user);
  }

  if (pathname.startsWith("/invoices")) return hasPermission(user, "invoices", "canView");
  if (pathname.startsWith("/purchases")) return hasPermission(user, "purchases", "canView");
  if (pathname.startsWith("/inventory")) return hasPermission(user, "inventory", "canView");
  if (pathname.startsWith("/imports")) return hasPermission(user, "imports", "canView");
  if (pathname.startsWith("/products")) return hasPermission(user, "products", "canView");
  if (pathname.startsWith("/categories")) return hasPermission(user, "categories", "canView");
  if (pathname.startsWith("/sales-channels")) return hasPermission(user, "salesChannels", "canView");
  if (pathname.startsWith("/suppliers")) return hasPermission(user, "suppliers", "canView");
  if (pathname.startsWith("/warehouses")) return hasPermission(user, "warehouses", "canView");
  if (pathname.startsWith("/reports")) return hasPermission(user, "reports", "canView");
  if (pathname.startsWith("/insights")) return hasPermission(user, "insights", "canView");

  return true;
}

export { PermissionGate, type PermissionGateProps } from "./permission-gate";
