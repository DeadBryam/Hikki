import { useMutation, useQueryClient } from "@tanstack/react-query";
import { threadsService } from "@/lib/services/threads-service";
import type { ApiResponse, ErrorResponse } from "@/types/api";

export function useDeleteThread() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<{ success: boolean }>, ErrorResponse, string>({
    mutationFn: (id: string) => threadsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["threads"] });
    },
  });
}
