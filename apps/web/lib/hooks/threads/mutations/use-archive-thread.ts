import { useMutation, useQueryClient } from "@tanstack/react-query";
import { threadsService } from "@/lib/services/threads-service";
import type { ApiResponse, ErrorResponse } from "@/types/api";
import type { PaginatedThreadsResponse, ThreadResponse } from "@/types/threads";

interface ArchiveContext {
  previousThreads: readonly [
    readonly unknown[],
    { data: PaginatedThreadsResponse } | undefined,
  ][];
}

export function useArchiveThread() {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<ThreadResponse>,
    ErrorResponse,
    string,
    ArchiveContext
  >({
    mutationFn: (id: string) => threadsService.archive(id),

    onMutate: async (archivedId) => {
      await queryClient.cancelQueries({ queryKey: ["threads"] });

      const previousThreads = queryClient.getQueriesData<{
        data: PaginatedThreadsResponse;
      }>({ queryKey: ["threads"] });

      queryClient.setQueriesData<{ data: PaginatedThreadsResponse }>(
        { queryKey: ["threads"] },
        (old) => {
          if (!old) {
            return old;
          }
          return {
            ...old,
            data: {
              ...old.data,
              items: old.data.items.filter(
                (thread) => thread.id !== archivedId
              ),
              pagination: {
                ...old.data.pagination,
                total: Math.max(0, old.data.pagination.total - 1),
              },
            },
          };
        }
      );

      return { previousThreads };
    },

    onError: (_error, _archivedId, context) => {
      if (context?.previousThreads) {
        for (const [queryKey, data] of context.previousThreads) {
          queryClient.setQueryData(queryKey as string[], data);
        }
      }
    },
  });
}
