import { api } from "@/lib/api/api";
import type { LoginInput, SignupInput } from "@/lib/schemas/auth";
import type { ApiResponse } from "@/types/api";

export interface AuthUser {
  createdAt?: string;
  email: string;
  id: string;
  name: string;
  onboarding_completed_at?: string;
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
  remaining?: number;
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
  async signup(data: SignupInput): Promise<ApiResponse<AuthResponse>> {
    const response = await api.post("api/v1/auth/signup", {
      json: {
        username: data.username,
        email: data.email,
        password: data.password,
      },
    });
    return response.json();
  },

  async login(data: LoginInput): Promise<ApiResponse<AuthResponse>> {
    const response = await api.post("api/v1/auth/login", {
      json: {
        username: data.username,
        password: data.password,
      },
    });
    return response.json();
  },

  async logout(): Promise<ApiResponse<LogoutResponse>> {
    const response = await api.post("api/v1/auth/logout");
    return response.json();
  },

  async getCurrentUser(): Promise<ApiResponse<AuthUser> | null> {
    const response = await api.get("api/v1/auth/user", { retry: 0 });
    return response.json();
  },

  async verifyEmail(token: string): Promise<ApiResponse<VerifyEmailResponse>> {
    const response = await api.get(
      `api/v1/auth/verify/email?token=${encodeURIComponent(token)}`
    );
    return response.json();
  },

  async resendVerification(
    email: string
  ): Promise<ApiResponse<ResendVerificationResponse>> {
    const response = await api.post("api/v1/auth/verify/resend", {
      json: { email },
    });
    return response.json();
  },

  async requestPasswordReset(
    email: string
  ): Promise<ApiResponse<RequestPasswordResetResponse>> {
    const response = await api.post("api/v1/auth/verify/forgot-password", {
      json: { email },
    });
    return response.json();
  },

  async validateResetToken(
    token: string
  ): Promise<ApiResponse<ValidateResetTokenResponse>> {
    const response = await api.get(
      `api/v1/auth/verify/validate-reset-token?token=${encodeURIComponent(token)}`
    );
    return response.json();
  },

  async resetPassword(
    token: string,
    password: string
  ): Promise<ApiResponse<ResetPasswordResponse>> {
    const response = await api.post("api/v1/auth/verify/reset-password", {
      json: { token, password },
    });
    return response.json();
  },
};
