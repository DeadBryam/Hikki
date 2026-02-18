import { SESSION_TOKEN_NAME } from "@/lib/const/cookie-names";
import { useAuthStore } from "@/lib/stores/auth-store";
import { getCookie } from "../utils/misc";
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

  const hasToken = Boolean(getCookie(SESSION_TOKEN_NAME));
  const {
    data: userData,
    isLoading: queryLoading,
    error: queryError,
  } = useUser({ enabled: hasToken });

  const user = userData?.data ?? storeUser;
  const isAuthenticated = Boolean(user);
  const isLoading = storeLoading || queryLoading;
  const error =
    storeError || (queryError instanceof Error ? queryError.message : null);

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    setUser,
    setError,
    clearError,
    logout,
  };
}
