import { useAuthStore } from "@/lib/stores/auth-store";
import { useUser } from "./auth/queries/use-user";

export function useAuth() {
  const {
    user: storeUser,
    isLoading: storeLoading,
    error: storeError,
    setUser,
    setError,
    clearError,
    logout,
  } = useAuthStore();
  const {
    data: userData,
    isLoading: queryLoading,
    error: queryError,
  } = useUser();

  const isAuthenticated = Boolean(userData || storeUser);
  const isLoading = storeLoading || queryLoading;
  const error =
    storeError || (queryError instanceof Error ? queryError.message : null);

  return {
    user: userData ?? storeUser,
    isLoading,
    error,
    isAuthenticated,
    setUser,
    setError,
    clearError,
    logout,
  };
}
