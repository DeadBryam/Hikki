import { useMutation, useQueryClient } from "@tanstack/react-query";
import { threadsService } from "@/lib/services/threads-service";
import type { ApiResponse, ErrorResponse } from "@/types/api";
import type { PaginatedThreadsResponse } from "@/types/threads";

interface DeleteContext {
  previousThreads: readonly [
    readonly unknown[],
    { data: PaginatedThreadsResponse } | undefined,
  ][];
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
      console.log("[useDeleteThread] onMutate - deletedId:", deletedId);

      await queryClient.cancelQueries({ queryKey: ["threads"] });

      // Get all threads queries to find matching ones
      const allThreadsQueries = queryClient.getQueriesData<{
        data: PaginatedThreadsResponse;
      }>({ queryKey: ["threads"] });
      console.log(
        "[useDeleteThread] all threads queries found:",
        allThreadsQueries.length
      );
      console.log(
        "[useDeleteThread] query keys:",
        allThreadsQueries.map(([key]) => key)
      );

      // Update all matching threads queries
      const updatedQueries = queryClient.setQueriesData<{
        data: PaginatedThreadsResponse;
      }>({ queryKey: ["threads"] }, (old) => {
        if (!old) {
          console.log("[useDeleteThread] old is null/undefined, skipping");
          return old;
        }
        console.log("[useDeleteThread] filtering thread:", deletedId);
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
      });

      console.log(
        "[useDeleteThread] updated queries count:",
        updatedQueries?.length
      );

      return { previousThreads: allThreadsQueries };
    },

    onError: (_error, _deletedId, context) => {
      console.log(
        "[useDeleteThread] onError - restoring:",
        context?.previousThreads
      );
      if (context?.previousThreads) {
        // Restore all queries that were updated
        for (const [queryKey, data] of context.previousThreads) {
          queryClient.setQueryData(queryKey as string[], data);
        }
      }
    },
  });
}
