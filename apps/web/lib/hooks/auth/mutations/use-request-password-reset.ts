import { useMutation } from "@tanstack/react-query";
import { authService } from "@/lib/services/auth-service";

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (email: string) => authService.requestPasswordReset(email),
  });
}
