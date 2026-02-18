import { useMutation } from "@tanstack/react-query";
import {
  authService,
  type ResendVerificationResponse,
} from "@/lib/services/auth-service";
import type { ApiResponse, ErrorResponse } from "@/types/api";

export function useResendVerification() {
  return useMutation<
    ApiResponse<ResendVerificationResponse>,
    ErrorResponse<{ remaining?: number }>,
    string
  >({ mutationFn: (email: string) => authService.resendVerification(email) });
}
