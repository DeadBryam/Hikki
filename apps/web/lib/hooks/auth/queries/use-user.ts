import { useQuery } from "@tanstack/react-query";
import { authService } from "@/lib/services/auth-service";

export function useUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: () => authService.getCurrentUser(),
    staleTime: 5 * 60 * 1000,
  });
}
