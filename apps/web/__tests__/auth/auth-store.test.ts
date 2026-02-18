import { beforeEach, describe, expect, it, vi } from "vitest";
import { authService } from "@/lib/services/auth-service";
import { useAuthStore } from "@/lib/stores/auth-store";

vi.mock("@/lib/services/auth-service");

describe("Auth Store", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      token: null,
      isLoading: false,
      error: null,
    });
    localStorage.clear();
  });

  describe("setUser", () => {
    it("should set user data", () => {
      const user = {
        id: "1",
        username: "testuser",
        email: "test@example.com",
        emailVerified: true,
        createdAt: new Date().toISOString(),
      };

      useAuthStore.getState().setUser(user);
      expect(useAuthStore.getState().user).toEqual(user);
    });

    it("should clear user with null", () => {
      const user = {
        id: "1",
        username: "testuser",
        email: "test@example.com",
        emailVerified: true,
        createdAt: new Date().toISOString(),
      };

      useAuthStore.getState().setUser(user);
      useAuthStore.getState().setUser(null);
      expect(useAuthStore.getState().user).toBeNull();
    });
  });

  describe("setToken", () => {
    it("should set token in store", () => {
      useAuthStore.getState().setToken("test-token");
      expect(useAuthStore.getState().token).toBe("test-token");
    });

    it("should persist token to localStorage", () => {
      useAuthStore.getState().setToken("test-token");
      expect(localStorage.getItem("auth_token")).toBe("test-token");
    });

    it("should remove token from localStorage when set to null", () => {
      localStorage.setItem("auth_token", "test-token");
      useAuthStore.getState().setToken(null);
      expect(localStorage.getItem("auth_token")).toBeNull();
    });

    it("should clear token from store and localStorage", () => {
      useAuthStore.getState().setToken("test-token");
      useAuthStore.getState().setToken(null);
      expect(useAuthStore.getState().token).toBeNull();
      expect(localStorage.getItem("auth_token")).toBeNull();
    });
  });

  describe("setLoading", () => {
    it("should set loading state to true", () => {
      useAuthStore.getState().setLoading(true);
      expect(useAuthStore.getState().isLoading).toBe(true);
    });

    it("should set loading state to false", () => {
      useAuthStore.getState().setLoading(true);
      useAuthStore.getState().setLoading(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe("setError", () => {
    it("should set error message", () => {
      useAuthStore.getState().setError("Test error message");
      expect(useAuthStore.getState().error).toBe("Test error message");
    });

    it("should set error to null", () => {
      useAuthStore.getState().setError("Error");
      useAuthStore.getState().setError(null);
      expect(useAuthStore.getState().error).toBeNull();
    });
  });

  describe("clearError", () => {
    it("should clear error message", () => {
      useAuthStore.getState().setError("Test error");
      useAuthStore.getState().clearError();
      expect(useAuthStore.getState().error).toBeNull();
    });

    it("should clear error when error is already null", () => {
      useAuthStore.getState().clearError();
      expect(useAuthStore.getState().error).toBeNull();
    });
  });

  describe("getIsAuthenticated", () => {
    it("should return true when token is present", () => {
      useAuthStore.getState().setToken("test-token");
      expect(useAuthStore.getState().getIsAuthenticated()).toBe(true);
    });

    it("should return false when token is null", () => {
      useAuthStore.getState().setToken(null);
      expect(useAuthStore.getState().getIsAuthenticated()).toBe(false);
    });

    it("should return false initially", () => {
      useAuthStore.setState({ token: null });
      expect(useAuthStore.getState().getIsAuthenticated()).toBe(false);
    });
  });

  describe("logout", () => {
    it("should clear user and token on successful logout", async () => {
      const mockLogout = vi.fn().mockResolvedValue({ success: true });
      vi.mocked(authService.logout).mockImplementation(mockLogout);

      useAuthStore.getState().setToken("test-token");
      useAuthStore.getState().setUser({
        id: "1",
        username: "testuser",
        email: "test@example.com",
        emailVerified: true,
        createdAt: new Date().toISOString(),
      });

      await useAuthStore.getState().logout();

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().token).toBeNull();
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it("should set loading state during logout", async () => {
      const mockLogout = vi.fn().mockResolvedValue({ success: true });
      vi.mocked(authService.logout).mockImplementation(mockLogout);

      useAuthStore.getState().setToken("test-token");

      const logoutPromise = useAuthStore.getState().logout();
      expect(useAuthStore.getState().isLoading).toBe(true);

      await logoutPromise;
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it("should set error on logout failure", async () => {
      const mockLogout = vi.fn().mockRejectedValue(new Error("Logout failed"));
      vi.mocked(authService.logout).mockImplementation(mockLogout);

      useAuthStore.getState().setToken("test-token");
      await useAuthStore.getState().logout();

      expect(useAuthStore.getState().error).toBe("Logout failed");
      expect(useAuthStore.getState().token).toBeNull();
    });

    it("should clear user data on logout failure", async () => {
      const mockLogout = vi.fn().mockRejectedValue(new Error("Logout failed"));
      vi.mocked(authService.logout).mockImplementation(mockLogout);

      useAuthStore.getState().setUser({
        id: "1",
        username: "testuser",
        email: "test@example.com",
        emailVerified: true,
        createdAt: new Date().toISOString(),
      });

      await useAuthStore.getState().logout();
      expect(useAuthStore.getState().user).toBeNull();
    });
  });

  describe("initializeFromStorage", () => {
    it("should load token from localStorage", () => {
      localStorage.setItem("auth_token", "persisted-token");
      useAuthStore.getState().initializeFromStorage();
      expect(useAuthStore.getState().token).toBe("persisted-token");
    });

    it("should not set token if none in localStorage", () => {
      localStorage.clear();
      useAuthStore.getState().initializeFromStorage();
      expect(useAuthStore.getState().token).toBeNull();
    });

    it("should restore state after page reload", () => {
      useAuthStore.getState().setToken("test-token");
      const savedToken = localStorage.getItem("auth_token");

      useAuthStore.setState({ token: null });
      useAuthStore.getState().initializeFromStorage();

      expect(useAuthStore.getState().token).toBe(savedToken);
    });
  });

  describe("State Persistence", () => {
    it("should maintain token across store updates", () => {
      useAuthStore.getState().setToken("test-token");
      useAuthStore.getState().setLoading(true);
      useAuthStore.getState().setError("Test error");

      expect(useAuthStore.getState().token).toBe("test-token");
      expect(useAuthStore.getState().isLoading).toBe(true);
      expect(useAuthStore.getState().error).toBe("Test error");
    });

    it("should not affect token when setting user", () => {
      useAuthStore.getState().setToken("test-token");
      useAuthStore.getState().setUser({
        id: "1",
        username: "testuser",
        email: "test@example.com",
        emailVerified: true,
        createdAt: new Date().toISOString(),
      });

      expect(useAuthStore.getState().token).toBe("test-token");
    });
  });
});
