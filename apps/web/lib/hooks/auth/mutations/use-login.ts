import { useMutation } from "@tanstack/react-query";
import type { LoginInput } from "@/lib/schemas/auth";
import { type AuthUser, authService } from "@/lib/services/auth-service";
import type { ApiResponse, ErrorResponse } from "@/types/api";

export function useLogin() {
  return useMutation<ApiResponse<AuthUser>, ErrorResponse, LoginInput>({
    mutationFn: (data: LoginInput) => authService.login(data),
  });
}
