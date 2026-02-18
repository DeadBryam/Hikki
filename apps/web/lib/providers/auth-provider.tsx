"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/lib/hooks/auth/queries/use-user";
import { useAuthStore } from "@/lib/stores/auth-store";
import { SESSION_TOKEN_NAME } from "../const/cookie-names";
import { getCookie } from "../utils/misc";

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider initializes authentication state on app load
 * This component:
 * - Prevents hydration mismatches by deferring rendering until client-side
 * - Fetches current user via TanStack Query (uses HttpOnly cookies automatically)
 * - Syncs user state to Zustand store
 *
 * Must be placed in root layout inside QueryProvider
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const setUser = useAuthStore((state) => state.setUser);
  const [isHydrated, setIsHydrated] = useState(false);

  const hasToken = Boolean(getCookie(SESSION_TOKEN_NAME));
  const { data: user } = useUser({ enabled: hasToken });

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (user !== undefined) {
      setUser(user?.data ?? null);
    }
  }, [user, setUser]);

  if (!isHydrated) {
    return null;
  }

  return <>{children}</>;
}
