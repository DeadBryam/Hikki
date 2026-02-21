import { useQuery } from "@tanstack/react-query";
import { threadsService } from "@/lib/services/threads-service";
import type { ListThreadsParams } from "@/types/threads";

export function useThreads(params: ListThreadsParams = {}) {
  return useQuery({
    queryKey: ["threads", params],
    queryFn: () => threadsService.list(params),
    staleTime: 30 * 1000,
  });
}
