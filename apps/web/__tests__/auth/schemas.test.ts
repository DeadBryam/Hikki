import { describe, expect, it } from "vitest";
import {
  emailVerificationSchema,
  forgotPasswordSchema,
  loginSchema,
  passwordSchema,
  resetPasswordSchema,
  signupSchema,
} from "@/lib/schemas/auth";

describe("Auth Schemas", () => {
  describe("passwordSchema", () => {
    it("should validate a strong password", () => {
      const valid = passwordSchema.safeParse("StrongPass123!");
      expect(valid.success).toBe(true);
    });

    it("should require at least 8 characters", () => {
      const result = passwordSchema.safeParse("Weak1!");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("8 characters");
      }
    });

    it("should require uppercase letter", () => {
      const result = passwordSchema.safeParse("lowercase123!");
      expect(result.success).toBe(false);
    });

    it("should require lowercase letter", () => {
      const result = passwordSchema.safeParse("UPPERCASE123!");
      expect(result.success).toBe(false);
    });

    it("should require number", () => {
      const result = passwordSchema.safeParse("NoNumbers!");
      expect(result.success).toBe(false);
    });

    it("should require special character", () => {
      const result = passwordSchema.safeParse("NoSpecial123");
      expect(result.success).toBe(false);
    });

    it("should accept valid special characters", () => {
      const specialChars = "!@#$%^&*";
      for (const char of specialChars) {
        const password = `Valid${char}123`;
        const result = passwordSchema.safeParse(password);
        expect(result.success).toBe(true);
      }
    });
  });

  describe("signupSchema", () => {
    it("should validate correct signup data", () => {
      const data = {
        username: "testuser123",
        email: "test@example.com",
        password: "StrongPass123!",
        passwordConfirm: "StrongPass123!",
      };
      const result = signupSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should require all fields", () => {
      const data = {
        username: "",
        email: "",
        password: "",
        passwordConfirm: "",
      };
      const result = signupSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should require username with at least 3 characters", () => {
      const result = signupSchema.safeParse({
        username: "ab",
        email: "test@example.com",
        password: "StrongPass123!",
        passwordConfirm: "StrongPass123!",
      });
      expect(result.success).toBe(false);
    });

    it("should reject username with invalid characters", () => {
      const result = signupSchema.safeParse({
        username: "test@user!",
        email: "test@example.com",
        password: "StrongPass123!",
        passwordConfirm: "StrongPass123!",
      });
      expect(result.success).toBe(false);
    });

    it("should allow username with numbers and underscores", () => {
      const result = signupSchema.safeParse({
        username: "test_user_123",
        email: "test@example.com",
        password: "StrongPass123!",
        passwordConfirm: "StrongPass123!",
      });
      expect(result.success).toBe(true);
    });

    it("should require valid email", () => {
      const result = signupSchema.safeParse({
        username: "testuser",
        email: "invalid-email",
        password: "StrongPass123!",
        passwordConfirm: "StrongPass123!",
      });
      expect(result.success).toBe(false);
    });

    it("should require passwords to match", () => {
      const result = signupSchema.safeParse({
        username: "testuser",
        email: "test@example.com",
        password: "StrongPass123!",
        passwordConfirm: "Different123!",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.some((issue) =>
            issue.path.includes("passwordConfirm")
          )
        ).toBe(true);
      }
    });

    it("should reject username over 50 characters", () => {
      const result = signupSchema.safeParse({
        username: "a".repeat(51),
        email: "test@example.com",
        password: "StrongPass123!",
        passwordConfirm: "StrongPass123!",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("loginSchema", () => {
    it("should validate correct login data", () => {
      const data = {
        username: "testuser",
        password: "Password123!",
      };
      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should require username field", () => {
      const result = loginSchema.safeParse({
        username: "",
        password: "Password123!",
      });
      expect(result.success).toBe(false);
    });

    it("should require password field", () => {
      const result = loginSchema.safeParse({
        username: "testuser",
        password: "",
      });
      expect(result.success).toBe(false);
    });

    it("should accept any non-empty username and password", () => {
      const result = loginSchema.safeParse({
        username: "user@example.com",
        password: "anything",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("forgotPasswordSchema", () => {
    it("should validate correct email", () => {
      const result = forgotPasswordSchema.safeParse({
        email: "test@example.com",
      });
      expect(result.success).toBe(true);
    });

    it("should require valid email format", () => {
      const result = forgotPasswordSchema.safeParse({
        email: "invalid-email",
      });
      expect(result.success).toBe(false);
    });

    it("should require email field", () => {
      const result = forgotPasswordSchema.safeParse({
        email: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("resetPasswordSchema", () => {
    it("should validate matching passwords", () => {
      const result = resetPasswordSchema.safeParse({
        password: "NewPass123!",
        passwordConfirm: "NewPass123!",
      });
      expect(result.success).toBe(true);
    });

    it("should enforce strong password", () => {
      const result = resetPasswordSchema.safeParse({
        password: "weak",
        passwordConfirm: "weak",
      });
      expect(result.success).toBe(false);
    });

    it("should require passwords to match", () => {
      const result = resetPasswordSchema.safeParse({
        password: "StrongPass123!",
        passwordConfirm: "Different123!",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("emailVerificationSchema", () => {
    it("should validate token", () => {
      const result = emailVerificationSchema.safeParse({
        token: "valid-token-123",
      });
      expect(result.success).toBe(true);
    });

    it("should require non-empty token", () => {
      const result = emailVerificationSchema.safeParse({
        token: "",
      });
      expect(result.success).toBe(false);
    });
  });
});
