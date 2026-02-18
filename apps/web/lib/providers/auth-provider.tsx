"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/use-auth";

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider initializes authentication from localStorage on app load
 * This component:
 * - Prevents hydration mismatches by deferring rendering until client-side
 * - Loads persisted auth token from localStorage
 * - Ensures auth state is synced before rendering protected routes
 *
 * Must be placed in root layout before any protected components
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const { initializeFromStorage } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);

    initializeFromStorage();
  }, [initializeFromStorage]);

  if (!isHydrated) {
    return null;
  }

  return <>{children}</>;
}
