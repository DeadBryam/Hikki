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

      expect(response.success).toBe(true);
      expect(response.data?.username).toBe("testuser");
      expect(response.data?.email).toBe("test@example.com");
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

      expect(response.success).toBe(true);
      expect(response.data?.username).toBe("testuser");
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
      ).rejects.toThrow("Error 401");
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
    it("should return success response", async () => {
      const response = await authService.logout();
      expect(response.success).toBe(true);
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
      expect(response.success).toBe(true);
      expect(response.data?.valid).toBe(true);
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
});
