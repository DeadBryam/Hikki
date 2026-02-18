import Cookies from "js-cookie";
import { api } from "@/lib/api";
import type { LoginInput, SignupInput } from "@/lib/schemas/auth";

export interface AuthUser {
  createdAt: string;
  email: string;
  emailVerified: boolean;
  id: string;
  username: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

const AUTH_TOKEN_KEY = "auth_token" as const;

/**
 * Set auth token in cookie
 */
function setCookie(token: string): void {
  const isProduction = process.env.NODE_ENV === "production";

  Cookies.set(AUTH_TOKEN_KEY, token, {
    path: "/",
    sameSite: "lax",
    secure: isProduction,
  });
}

/**
 * Clear auth token from cookie
 */
function clearCookie(): void {
  Cookies.remove(AUTH_TOKEN_KEY, { path: "/" });
}

/**
 * Auth Service
 * Handles all authentication operations: signup, login, logout, email verification, password reset
 *
 * Token Flow:
 * 1. Backend returns token in response
 * 2. Token is stored in localStorage (client-side state) AND cookies (server-side protection)
 * 3. API client sends token in Authorization header
 * 4. Middleware checks token from cookies (server-side protection)
 * 5. API with credentials:include sends/receives cookies automatically
 */
export const authService = {
  /**
   * Sign up new user
   * - Validates input with Zod schema
   * - Calls POST /api/v1/auth/signup
   * - Stores token in localStorage and cookies
   */
  async signup(data: SignupInput): Promise<AuthResponse> {
    try {
      const response = await api.post("api/v1/auth/signup", {
        json: {
          username: data.username,
          email: data.email,
          password: data.password,
        },
      });

      const result = (await response.json()) as AuthResponse;
      localStorage.setItem(AUTH_TOKEN_KEY, result.token);
      setCookie(result.token);
      return result;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error creating account";
      throw new Error(message);
    }
  },

  /**
   * Log in user
   * - Validates credentials with Zod schema
   * - Calls POST /api/v1/auth/login
   * - Stores token in localStorage and cookies
   */
  async login(data: LoginInput): Promise<AuthResponse> {
    try {
      const response = await api.post("api/v1/auth/login", {
        json: {
          username: data.username,
          password: data.password,
        },
      });

      const result = (await response.json()) as AuthResponse;
      localStorage.setItem(AUTH_TOKEN_KEY, result.token);
      setCookie(result.token);
      return result;
    } catch (error) {
      if (error instanceof Error && error.message.includes("401")) {
        throw new Error("Invalid username or password");
      }
      const message =
        error instanceof Error ? error.message : "Error signing in";
      throw new Error(message);
    }
  },

  /**
   * Log out user
   * - Calls POST /api/v1/auth/logout with token in header
   * - Clears token from localStorage and cookies
   */
  async logout(): Promise<{ success: boolean }> {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (token) {
        await api.post("api/v1/auth/logout", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      localStorage.removeItem(AUTH_TOKEN_KEY);
      clearCookie();
      return { success: true };
    } catch (error) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      clearCookie();
      const message =
        error instanceof Error ? error.message : "Error signing out";
      throw new Error(message);
    }
  },

  /**
   * Verify email with token from email link
   * - Calls GET /api/v1/auth/verify/email?token=xxx
   * - Token sent in query parameter
   */
  async verifyEmail(token: string): Promise<{ success: boolean }> {
    try {
      await api.get(
        `api/v1/auth/verify/email?token=${encodeURIComponent(token)}`
      );
      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error verifying email";
      throw new Error(message);
    }
  },

  /**
   * Resend verification email
   * - Calls POST /api/v1/auth/verify/resend
   * - Requires valid email
   */
  async resendVerification(email: string): Promise<{ success: boolean }> {
    try {
      await api.post("api/v1/auth/verify/resend", {
        json: { email },
      });
      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error resending verification email";
      throw new Error(message);
    }
  },

  /**
   * Request password reset
   * - Calls POST /api/v1/auth/verify/forgot-password
   * - Backend sends reset link via email
   */
  async requestPasswordReset(email: string): Promise<{ success: boolean }> {
    try {
      await api.post("api/v1/auth/verify/forgot-password", {
        json: { email },
      });
      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error requesting password reset";
      throw new Error(message);
    }
  },

  /**
   * Validate password reset token
   * - Calls GET /api/v1/auth/verify/validate-reset-token?token=xxx
   * - Checks if token is still valid
   */
  async validateResetToken(token: string): Promise<{ valid: boolean }> {
    try {
      await api.get(
        `api/v1/auth/verify/validate-reset-token?token=${encodeURIComponent(token)}`
      );
      return { valid: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Token is invalid or expired";
      throw new Error(message);
    }
  },

  /**
   * Reset password with token
   * - Calls POST /api/v1/auth/verify/reset-password
   * - Requires valid reset token and new password
   */
  async resetPassword(
    token: string,
    password: string
  ): Promise<{ success: boolean }> {
    try {
      await api.post("api/v1/auth/verify/reset-password", {
        json: { token, password },
      });
      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error resetting password";
      throw new Error(message);
    }
  },

  /**
   * Get current token from localStorage
   */
  getToken(): string | null {
    if (typeof window === "undefined") {
      return null;
    }
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  /**
   * Clear token from localStorage and cookies
   * Used during logout or token expiration
   */
  clearToken(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    clearCookie();
  },
};
