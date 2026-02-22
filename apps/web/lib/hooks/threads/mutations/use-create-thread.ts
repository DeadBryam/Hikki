import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTransitionRouter } from "next-view-transitions";
import { threadsService } from "@/lib/services/threads-service";
import type { ApiResponse, ErrorResponse } from "@/types/api";
import type { CreateThreadResponse } from "@/types/threads";

export function useCreateThread() {
  const queryClient = useQueryClient();
  const router = useTransitionRouter();

  return useMutation<
    ApiResponse<CreateThreadResponse>,
    ErrorResponse,
    string | undefined
  >({
    mutationFn: (title?: string) => threadsService.create(title),
    onSuccess: async (response) => {
      if (response.data?.id) {
        // Invalidate and refetch threads list immediately
        await queryClient.invalidateQueries({
          queryKey: ["threads"],
          refetchType: "active",
        });
        router.push(`/chat/${response.data.id}`);
      }
    },
  });
}
