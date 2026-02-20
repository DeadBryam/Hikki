import { useQuery } from "@tanstack/react-query";
import {
  type ListThreadsParams,
  threadsService,
} from "@/lib/services/threads-service";

export function useThreads(params: ListThreadsParams = {}) {
  return useQuery({
    queryKey: ["threads", params],
    queryFn: () => threadsService.list(params),
    staleTime: 30 * 1000,
  });
}
