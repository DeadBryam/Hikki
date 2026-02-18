import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it } from "vitest";
import { authService } from "@/lib/services/auth-service";
import { server } from "@/vitest.setup";

describe("Auth Service", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("signup", () => {
    it("should sign up user with valid credentials", async () => {
      const response = await authService.signup({
        username: "testuser",
        email: "test@example.com",
        password: "StrongPass123!",
        passwordConfirm: "StrongPass123!",
      });

      expect(response.token).toBe("test-token");
      expect(response.user.username).toBe("testuser");
      expect(response.user.email).toBe("test@example.com");
    });

    it("should store token in localStorage after signup", async () => {
      await authService.signup({
        username: "testuser",
        email: "test@example.com",
        password: "StrongPass123!",
        passwordConfirm: "StrongPass123!",
      });

      const token = localStorage.getItem("auth_token");
      expect(token).toBe("test-token");
    });

    it("should throw error on duplicate email", async () => {
      server.use(
        http.post("/api/v1/auth/signup", () => {
          return HttpResponse.json(
            { error: "Email already exists" },
            { status: 409 }
          );
        })
      );

      await expect(
        authService.signup({
          username: "testuser",
          email: "existing@example.com",
          password: "StrongPass123!",
          passwordConfirm: "StrongPass123!",
        })
      ).rejects.toThrow();
    });

    it("should throw error on network failure", async () => {
      server.use(
        http.post("/api/v1/auth/signup", () => {
          return HttpResponse.error();
        })
      );

      await expect(
        authService.signup({
          username: "testuser",
          email: "test@example.com",
          password: "StrongPass123!",
          passwordConfirm: "StrongPass123!",
        })
      ).rejects.toThrow();
    });
  });

  describe("login", () => {
    it("should log in user with valid credentials", async () => {
      const response = await authService.login({
        username: "testuser",
        password: "StrongPass123!",
      });

      expect(response.token).toBe("test-token");
      expect(response.user.username).toBe("testuser");
      expect(response.user.emailVerified).toBe(true);
    });

    it("should store token in localStorage after login", async () => {
      await authService.login({
        username: "testuser",
        password: "StrongPass123!",
      });

      const token = localStorage.getItem("auth_token");
      expect(token).toBe("test-token");
    });

    it("should throw error on invalid credentials", async () => {
      server.use(
        http.post("/api/v1/auth/login", () => {
          return HttpResponse.json(
            { error: "Invalid credentials" },
            { status: 401 }
          );
        })
      );

      await expect(
        authService.login({
          username: "testuser",
          password: "WrongPassword123!",
        })
      ).rejects.toThrow("Usuario o contraseña inválidos");
    });

    it("should throw error on user not found", async () => {
      server.use(
        http.post("/api/v1/auth/login", () => {
          return HttpResponse.json(
            { error: "User not found" },
            { status: 404 }
          );
        })
      );

      await expect(
        authService.login({
          username: "nonexistent",
          password: "Password123!",
        })
      ).rejects.toThrow();
    });
  });

  describe("logout", () => {
    it("should remove token from localStorage on logout", async () => {
      localStorage.setItem("auth_token", "test-token");
      await authService.logout();
      expect(localStorage.getItem("auth_token")).toBeNull();
    });

    it("should return success response", async () => {
      localStorage.setItem("auth_token", "test-token");
      const response = await authService.logout();
      expect(response.success).toBe(true);
    });

    it("should clear token even on API failure", async () => {
      localStorage.setItem("auth_token", "test-token");
      server.use(
        http.post("/api/v1/auth/logout", () => {
          return HttpResponse.json({ error: "Logout failed" }, { status: 500 });
        })
      );

      await expect(authService.logout()).rejects.toThrow();
      expect(localStorage.getItem("auth_token")).toBeNull();
    });

    it("should succeed even without token", async () => {
      const response = await authService.logout();
      expect(response.success).toBe(true);
    });
  });

  describe("verifyEmail", () => {
    it("should verify email with valid token", async () => {
      const response = await authService.verifyEmail("valid-token-123");
      expect(response.success).toBe(true);
    });

    it("should throw error on invalid token", async () => {
      server.use(
        http.get("/api/v1/auth/verify/email", () => {
          return HttpResponse.json({ error: "Invalid token" }, { status: 400 });
        })
      );

      await expect(authService.verifyEmail("invalid-token")).rejects.toThrow();
    });

    it("should throw error on expired token", async () => {
      server.use(
        http.get("/api/v1/auth/verify/email", () => {
          return HttpResponse.json({ error: "Token expired" }, { status: 410 });
        })
      );

      await expect(authService.verifyEmail("expired-token")).rejects.toThrow();
    });
  });

  describe("resendVerification", () => {
    it("should resend verification email", async () => {
      const response = await authService.resendVerification("test@example.com");
      expect(response.success).toBe(true);
    });

    it("should throw error on invalid email", async () => {
      server.use(
        http.post("/api/v1/auth/verify/resend", () => {
          return HttpResponse.json(
            { error: "Email not found" },
            { status: 404 }
          );
        })
      );

      await expect(
        authService.resendVerification("nonexistent@example.com")
      ).rejects.toThrow();
    });
  });

  describe("requestPasswordReset", () => {
    it("should request password reset", async () => {
      const response =
        await authService.requestPasswordReset("test@example.com");
      expect(response.success).toBe(true);
    });

    it("should throw error on invalid email", async () => {
      server.use(
        http.post("/api/v1/auth/verify/forgot-password", () => {
          return HttpResponse.json(
            { error: "Email not found" },
            { status: 404 }
          );
        })
      );

      await expect(
        authService.requestPasswordReset("nonexistent@example.com")
      ).rejects.toThrow();
    });
  });

  describe("validateResetToken", () => {
    it("should validate reset token", async () => {
      const response = await authService.validateResetToken("valid-token");
      expect(response.valid).toBe(true);
    });

    it("should throw error on invalid token", async () => {
      server.use(
        http.get("/api/v1/auth/verify/validate-reset-token", () => {
          return HttpResponse.json({ error: "Token invalid" }, { status: 400 });
        })
      );

      await expect(
        authService.validateResetToken("invalid-token")
      ).rejects.toThrow();
    });

    it("should throw error on expired token", async () => {
      server.use(
        http.get("/api/v1/auth/verify/validate-reset-token", () => {
          return HttpResponse.json({ error: "Token expired" }, { status: 410 });
        })
      );

      await expect(
        authService.validateResetToken("expired-token")
      ).rejects.toThrow();
    });
  });

  describe("resetPassword", () => {
    it("should reset password with valid token and password", async () => {
      const response = await authService.resetPassword(
        "valid-token",
        "NewPass123!"
      );
      expect(response.success).toBe(true);
    });

    it("should throw error on invalid token", async () => {
      server.use(
        http.post("/api/v1/auth/verify/reset-password", () => {
          return HttpResponse.json({ error: "Invalid token" }, { status: 400 });
        })
      );

      await expect(
        authService.resetPassword("invalid-token", "NewPass123!")
      ).rejects.toThrow();
    });

    it("should throw error on weak password", async () => {
      server.use(
        http.post("/api/v1/auth/verify/reset-password", () => {
          return HttpResponse.json(
            { error: "Password too weak" },
            { status: 400 }
          );
        })
      );

      await expect(
        authService.resetPassword("valid-token", "weak")
      ).rejects.toThrow();
    });
  });

  describe("getToken", () => {
    it("should return token from localStorage", () => {
      localStorage.setItem("auth_token", "test-token");
      const token = authService.getToken();
      expect(token).toBe("test-token");
    });

    it("should return null if no token", () => {
      localStorage.clear();
      const token = authService.getToken();
      expect(token).toBeNull();
    });
  });

  describe("clearToken", () => {
    it("should remove token from localStorage", () => {
      localStorage.setItem("auth_token", "test-token");
      authService.clearToken();
      expect(localStorage.getItem("auth_token")).toBeNull();
    });

    it("should not throw error if no token exists", () => {
      localStorage.clear();
      expect(() => authService.clearToken()).not.toThrow();
    });
  });
});
