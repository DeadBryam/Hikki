import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTransitionRouter } from "next-view-transitions";
import type { CreateThreadResponse } from "@/lib/services/threads-service";
import { threadsService } from "@/lib/services/threads-service";
import type { ApiResponse, ErrorResponse } from "@/types/api";

export function useCreateThread() {
  const queryClient = useQueryClient();
  const router = useTransitionRouter();

  return useMutation<
    ApiResponse<CreateThreadResponse>,
    ErrorResponse,
    string | undefined
  >({
    mutationFn: (title?: string) => threadsService.create(title),
    onSuccess: (response) => {
      if (response.data?.id) {
        queryClient.invalidateQueries({ queryKey: ["threads"] });
        router.push(`/chat/${response.data.id}`);
      }
    },
  });
}
