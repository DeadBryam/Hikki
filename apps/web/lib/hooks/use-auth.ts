import { useAuthStore } from "@/lib/stores/auth-store";

export const useAuth = () => {
  const {
    user,
    token,
    isLoading,
    error,
    getIsAuthenticated,
    setUser,
    setToken,
    setLoading,
    setError,
    clearError,
    logout,
    initializeFromStorage,
  } = useAuthStore();

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated: getIsAuthenticated(),
    setUser,
    setToken,
    setLoading,
    setError,
    clearError,
    logout,
    initializeFromStorage,
  };
};
