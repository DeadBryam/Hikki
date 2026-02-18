import { useMutation } from "@tanstack/react-query";
import { authService } from "@/lib/services/auth-service";

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (token: string) => authService.verifyEmail(token),
  });
}
