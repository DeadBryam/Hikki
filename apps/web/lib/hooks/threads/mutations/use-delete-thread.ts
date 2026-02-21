import { useMutation, useQueryClient } from "@tanstack/react-query";
import { threadsService } from "@/lib/services/threads-service";
import type { ApiResponse, ErrorResponse } from "@/types/api";
import type { PaginatedThreadsResponse } from "@/types/threads";

interface DeleteContext {
  previousThreads: { data: PaginatedThreadsResponse } | undefined;
}

export function useDeleteThread() {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<{ success: boolean }>,
    ErrorResponse,
    string,
    DeleteContext
  >({
    mutationFn: (id: string) => threadsService.delete(id),

    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ["threads"] });
      const previousThreads = queryClient.getQueryData<{
        data: PaginatedThreadsResponse;
      }>(["threads"]);

      queryClient.setQueryData<{ data: PaginatedThreadsResponse }>(
        ["threads"],
        (old) => {
          if (!old) {
            return old;
          }
          const newItems = old.data.items.filter(
            (thread) => thread.id !== deletedId
          );
          const newTotal = Math.max(0, old.data.pagination.total - 1);
          return {
            data: {
              items: newItems,
              pagination: {
                ...old.data.pagination,
                total: newTotal,
              },
            },
          };
        }
      );

      return { previousThreads };
    },

    onError: (_error, _deletedId, context) => {
      if (context?.previousThreads) {
        queryClient.setQueryData(["threads"], context.previousThreads);
      }
    },
  });
}
