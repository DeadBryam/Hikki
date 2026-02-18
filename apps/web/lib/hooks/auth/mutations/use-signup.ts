import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { SignupInput } from "@/lib/schemas/auth";
import { authService } from "@/lib/services/auth-service";
import { useAuthStore } from "@/lib/stores/auth-store";

export function useSignup() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (data: SignupInput) => authService.signup(data),
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: ["user"] });
      router.push("/dashboard");
    },
  });
}
