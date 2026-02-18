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
  user: AuthUser;
}

export interface LogoutResponse {
  success: boolean;
}

export interface VerifyEmailResponse {
  success: boolean;
}

export interface ResendVerificationResponse {
  success: boolean;
}

export interface RequestPasswordResetResponse {
  success: boolean;
}

export interface ValidateResetTokenResponse {
  valid: boolean;
}

export interface ResetPasswordResponse {
  success: boolean;
}

export const authService = {
  async signup(data: SignupInput): Promise<AuthResponse> {
    const response = await api.post("api/v1/auth/signup", {
      json: {
        username: data.username,
        email: data.email,
        password: data.password,
      },
    });
    return response.json();
  },

  async login(data: LoginInput): Promise<AuthResponse> {
    const response = await api.post("api/v1/auth/login", {
      json: {
        username: data.username,
        password: data.password,
      },
    });
    return response.json();
  },

  async logout(): Promise<LogoutResponse> {
    await api.post("api/v1/auth/logout");
    return { success: true };
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const response = await api.get("api/v1/auth/user");
      return response.json();
    } catch {
      return null;
    }
  },

  async verifyEmail(token: string): Promise<VerifyEmailResponse> {
    await api.get(
      `api/v1/auth/verify/email?token=${encodeURIComponent(token)}`
    );
    return { success: true };
  },

  async resendVerification(email: string): Promise<ResendVerificationResponse> {
    await api.post("api/v1/auth/verify/resend", {
      json: { email },
    });
    return { success: true };
  },

  async requestPasswordReset(
    email: string
  ): Promise<RequestPasswordResetResponse> {
    await api.post("api/v1/auth/verify/forgot-password", {
      json: { email },
    });
    return { success: true };
  },

  async validateResetToken(token: string): Promise<ValidateResetTokenResponse> {
    await api.get(
      `api/v1/auth/verify/validate-reset-token?token=${encodeURIComponent(token)}`
    );
    return { valid: true };
  },

  async resetPassword(
    token: string,
    password: string
  ): Promise<ResetPasswordResponse> {
    await api.post("api/v1/auth/verify/reset-password", {
      json: { token, password },
    });
    return { success: true };
  },
};
