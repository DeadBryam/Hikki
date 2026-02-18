import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { LoginInput } from "@/lib/schemas/auth";
import { authService } from "@/lib/services/auth-service";
import { useAuthStore } from "@/lib/stores/auth-store";

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const clearError = useAuthStore((state) => state.clearError);

  return useMutation({
    mutationFn: (data: LoginInput) => authService.login(data),
    onSuccess: (data) => {
      clearError();
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: ["user"] });
      router.push("/dashboard");
    },
  });
}
