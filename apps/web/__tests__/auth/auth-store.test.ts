import { beforeEach, describe, expect, it } from "vitest";
import { useAuthStore } from "@/lib/stores/auth-store";

describe("Auth Store", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isLoading: false,
      error: null,
    });
  });

  describe("setUser", () => {
    it("should set user data", () => {
      const user = {
        id: "1",
        name: "Test User",
        username: "testuser",
        email: "test@example.com",
        createdAt: new Date().toISOString(),
      };

      useAuthStore.getState().setUser(user);
      expect(useAuthStore.getState().user).toEqual(user);
    });

    it("should clear user with null", () => {
      const user = {
        id: "1",
        name: "Test User",
        username: "testuser",
        email: "test@example.com",
        createdAt: new Date().toISOString(),
      };

      useAuthStore.getState().setUser(user);
      useAuthStore.getState().setUser(null);
      expect(useAuthStore.getState().user).toBeNull();
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

  describe("logout", () => {
    it("should clear user and error on logout", () => {
      useAuthStore.getState().setUser({
        id: "1",
        name: "Test User",
        username: "testuser",
        email: "test@example.com",
        createdAt: new Date().toISOString(),
      });
      useAuthStore.getState().setError("Some error");

      useAuthStore.getState().logout();

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().error).toBeNull();
    });
  });
});
