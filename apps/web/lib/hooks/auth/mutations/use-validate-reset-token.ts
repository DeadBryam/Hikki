import { useMutation } from "@tanstack/react-query";
import { authService } from "@/lib/services/auth-service";

export function useValidateResetToken() {
  return useMutation({
    mutationFn: (token: string) => authService.validateResetToken(token),
  });
}
