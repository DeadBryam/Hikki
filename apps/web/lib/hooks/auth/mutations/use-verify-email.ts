import { useMutation } from "@tanstack/react-query";
import {
  authService,
  type VerifyEmailResponse,
} from "@/lib/services/auth-service";
import type { ApiResponse, ErrorResponse } from "@/types/api";

export function useVerifyEmail() {
  return useMutation<ApiResponse<VerifyEmailResponse>, ErrorResponse, string>({
    mutationFn: (token: string) => authService.verifyEmail(token),
  });
}
