"use client";

import React from "react";
import { useAuth } from "./auth-context";
import {
  hasPermission,
  type SystemModule,
  type PermissionAction,
} from "./permissions";
import type { UserSession } from "../api/auth.api";

export interface PermissionGateProps {
  user?: UserSession | null;
  module: SystemModule;
  action?: PermissionAction;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * PermissionGate Component:
 * Conditionally renders children if current user has the required permission.
 * Automatically resolves the active authenticated user from AuthContext if `user` prop is omitted.
 */
export function PermissionGate({
  user,
  module,
  action = "canView",
  children,
  fallback = null,
}: PermissionGateProps) {
  const auth = useAuth();
  const effectiveUser = user !== undefined ? user : auth.user;
  const allowed = hasPermission(effectiveUser, module, action);

  return allowed ? <>{children}</> : <>{fallback}</>;
}

