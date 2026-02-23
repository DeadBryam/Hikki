import { useQuery } from "@tanstack/react-query";
import { memoryService } from "@/lib/services/memory-service";

export const MEMORIES_KEY = ["memories"];

export function useMemories() {
  return useQuery({
    queryKey: MEMORIES_KEY,
    queryFn: () => memoryService.list(),
  });
}
