import { useMutation } from "@tanstack/react-query";
import type { SignupInput } from "@/lib/schemas/auth";
import { authService } from "@/lib/services/auth-service";

export function useSignup() {
  return useMutation({
    mutationFn: (data: SignupInput) => authService.signup(data),
  });
}
