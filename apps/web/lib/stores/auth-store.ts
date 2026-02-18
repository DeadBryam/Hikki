import { create } from "zustand";
import type { AuthUser } from "@/lib/services/auth-service";

interface AuthState {
  error: string | null;
  isLoading: boolean;
  user: AuthUser | null;
}

interface AuthActions {
  clearError: () => void;
  logout: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  setUser: (user: AuthUser | null) => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  logout: () => set({ user: null, error: null }),
}));
