import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/services/auth-service";
import { useAuthStore } from "@/lib/stores/auth-store";

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
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
