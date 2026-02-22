import { useQuery } from "@tanstack/react-query";
import { getLimits, type Limits } from "@/lib/repositories/limits-repository";

export function useLimits() {
  return useQuery<Limits>({
    queryKey: ["limits"],
    queryFn: async () => await getLimits(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
