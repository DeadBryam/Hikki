"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/use-auth";

interface AuthGuardProps {
  children: React.ReactNode;
  /**
   * Path to redirect to if authentication check fails
   * Default: "/auth/login"
   */
  fallback?: React.ReactNode;
  redirectTo?: string;
}

/**
 * AuthGuard is a client-side wrapper component that protects child components
 * from being rendered to unauthenticated users.
 *
 * Features:
 * - Shows loading spinner while checking authentication
 * - Automatically redirects to login if not authenticated
 * - Prevents flash of protected content to unauthorized users
 * - Supports custom redirect destination and fallback UI
 *
 * Usage:
 * ```tsx
 * <AuthGuard>
 *   <ProtectedComponent />
 * </AuthGuard>
 * ```
 */
export function AuthGuard({
  children,
  fallback,
  redirectTo = "/auth/login",
}: AuthGuardProps) {
  const { isAuthenticated, isLoading, initializeFromStorage } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  // Initialize authentication state on component mount
  useEffect(() => {
    setIsMounted(true);
    initializeFromStorage();
  }, [initializeFromStorage]);

  // Redirect if not authenticated (after loading completes)
  useEffect(() => {
    if (isMounted && !isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isMounted, isLoading, isAuthenticated, redirectTo, router]);

  // Show loading state while checking authentication
  if (!isMounted || isLoading) {
    return (
      fallback || (
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground text-sm">Loading...</p>
          </div>
        </div>
      )
    );
  }

  // Show protected content if authenticated
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Show loading state while redirecting
  return (
    fallback || (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground text-sm">Redirecting...</p>
        </div>
      </div>
    )
  );
}
