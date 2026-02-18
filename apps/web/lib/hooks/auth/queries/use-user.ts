import { useQuery } from "@tanstack/react-query";
import { authService } from "@/lib/services/auth-service";

interface UseUserProps {
  enabled?: boolean;
}

export function useUser(props: UseUserProps = {}) {
  const { enabled = true } = props;

  return useQuery({
    queryKey: ["user"],
    queryFn: () => authService.getCurrentUser(),
    staleTime: 5 * 60 * 1000,
    enabled,
  });
}
