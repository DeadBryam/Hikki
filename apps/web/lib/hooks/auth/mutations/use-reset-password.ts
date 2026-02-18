import { useMutation } from "@tanstack/react-query";
import { authService } from "@/lib/services/auth-service";

interface ResetPasswordData {
  password: string;
  token: string;
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: ResetPasswordData) =>
      authService.resetPassword(data.token, data.password),
  });
}
