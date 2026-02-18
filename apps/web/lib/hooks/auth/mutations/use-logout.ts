import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTransitionRouter } from "next-view-transitions";
import { authService } from "@/lib/services/auth-service";
import { useAuthStore } from "@/lib/stores/auth-store";

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useTransitionRouter();
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      logout();
      queryClient.clear();
      router.push("/login");
    },
  });
}
