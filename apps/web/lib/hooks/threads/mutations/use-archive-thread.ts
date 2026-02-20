import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type Thread, threadsService } from "@/lib/services/threads-service";
import type { ApiResponse, ErrorResponse } from "@/types/api";

export function useArchiveThread() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<Thread>, ErrorResponse, string>({
    mutationFn: (id: string) => threadsService.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["threads"] });
    },
  });
}
