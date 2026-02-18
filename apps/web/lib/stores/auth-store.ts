import { create } from "zustand";
import { type AuthUser, authService } from "@/lib/services/auth-service";

export interface AuthState {
  clearError: () => void;
  error: string | null;
  getIsAuthenticated: () => boolean;
  initializeFromStorage: () => void;
  isLoading: boolean;
  logout: () => Promise<void>;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  setToken: (token: string | null) => void;
  setUser: (user: AuthUser | null) => void;
  token: string | null;
  user: AuthUser | null;
}

/**
 * Get auth token from cookie
 */
function getCookieToken(): string | null {
  if (typeof document === "undefined") {
    return null;
  }
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split("=");
    if (key === "auth_token" && value) {
      return decodeURIComponent(value);
    }
  }
  return null;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  /**
   * Get current authentication status
   * Checks if token is present and valid
   */
  getIsAuthenticated: () => {
    return get().token !== null;
  },

  /**
   * Set user data
   * Called after successful auth response
   */
  setUser: (user) => {
    set({ user });
  },

  /**
   * Set authentication token
   * Persists to localStorage for client-side access
   * Middleware reads from cookies (server-side) for protection
   */
  setToken: (token) => {
    set({ token });
    if (token) {
      localStorage.setItem("auth_token", token);
    } else {
      localStorage.removeItem("auth_token");
    }
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setError: (error) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },

  /**
   * Logout user and clean up auth state
   * - Calls backend logout API
   * - Clears token from localStorage and cookies
   * - Resets user data
   */
  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await authService.logout();
      set({ user: null, token: null, isLoading: false });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al cerrar sesión";
      set({
        error: message,
        isLoading: false,
        user: null,
        token: null,
      });
    }
  },

  /**
   * Initialize auth state from localStorage and cookies
   * Called once on app load to restore persisted session
   * This is called by AuthProvider and route guards
   */
  initializeFromStorage: () => {
    if (typeof window === "undefined") {
      return;
    }

    let token = localStorage.getItem("auth_token");
    if (!token) {
      token = getCookieToken();
    }
    if (token) {
      set({ token });
    }
  },
}));
