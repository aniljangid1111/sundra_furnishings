"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getCurrentSession,
  loginUser,
  logoutUser,
  type LoginCredentials,
  type UserSession,
} from "../api/auth.api";
import {
  hasPermission,
  type SystemModule,
  type PermissionAction,
  isAdmin as checkIsAdmin,
} from "./permissions";

interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  hasAccess: (module: SystemModule, action?: PermissionAction) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  initialUser = null,
  children,
}: {
  initialUser?: UserSession | null;
  children: React.ReactNode;
}) {
  // Starts with initialUser provided by server-side cookie read (100% hydration-safe)
  const [user, setUser] = useState<UserSession | null>(initialUser);
  const [isLoading, setIsLoading] = useState(!initialUser);
  const router = useRouter();

  // Background verification of session
  useEffect(() => {
    let isMounted = true;
    async function verifySession() {
      try {
        const sessionUser = await getCurrentSession();
        if (isMounted && sessionUser) {
          setUser(sessionUser);
        }
      } catch {
        if (isMounted && !initialUser) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    verifySession();
    return () => {
      isMounted = false;
    };
  }, [initialUser]);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const { user: loggedInUser } = await loginUser(credentials);
      setUser(loggedInUser);
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutUser();
      setUser(null);
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const hasAccess = (module: SystemModule, action: PermissionAction = "canView") => {
    return hasPermission(user, module, action);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        isAdmin: checkIsAdmin(user),
        login,
        logout,
        hasAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
