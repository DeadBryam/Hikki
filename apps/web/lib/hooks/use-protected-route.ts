import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/hooks/use-auth";

interface UseProtectedRouteOptions {
  redirectTo?: string;
}

interface UseProtectedRouteReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * useProtectedRoute is a hook for protecting individual pages/routes
 * It automatically redirects unauthenticated users to login
 *
 * Features:
 * - Checks authentication status
 * - Automatically redirects if not authenticated
 * - Returns loading state for conditional rendering
 * - Can be used in page components directly
 *
 * Usage (in page.tsx):
 * ```tsx
 * export default function ChatPage() {
 *   const { isLoading } = useProtectedRoute();
 *
 *   if (isLoading) return <LoadingSpinner />;
 *
 *   return <ChatContent />;
 * }
 * ```
 *
 * Note: For better UX, prefer using <AuthGuard> in layout.tsx
 * This hook is useful for page-specific protection logic
 */
export function useProtectedRoute(
  options: UseProtectedRouteOptions = {}
): UseProtectedRouteReturn {
  const { redirectTo = "/auth/login" } = options;
  const { isAuthenticated, isLoading, initializeFromStorage } = useAuth();
  const router = useRouter();

  useEffect(() => {
    initializeFromStorage();
  }, [initializeFromStorage]);

  useEffect(() => {
    if (!(isLoading || isAuthenticated)) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, redirectTo, router]);

  return {
    isLoading,
    isAuthenticated,
  };
}
