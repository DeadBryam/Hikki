import { create } from "zustand";
import type { AuthUser } from "@/lib/services/auth-service";

export interface AuthState {
  clearError: () => void;
  error: string | null;
  isLoading: boolean;
  logout: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  setUser: (user: AuthUser | null) => void;
  user: AuthUser | null;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  setUser: (user) => {
    set({ user });
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

  logout: () => {
    set({ user: null, error: null });
  },
}));
