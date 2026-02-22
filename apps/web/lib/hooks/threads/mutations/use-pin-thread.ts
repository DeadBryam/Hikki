import { useMutation, useQueryClient } from "@tanstack/react-query";
import { threadsService } from "@/lib/services/threads-service";
import type { ApiResponse, ErrorResponse } from "@/types/api";
import type { PaginatedThreadsResponse, ThreadResponse } from "@/types/threads";

interface PinVariables {
  id: string;
}

interface PinContext {
  previousThreads: readonly [
    readonly unknown[],
    { data: PaginatedThreadsResponse } | undefined,
  ][];
}

export function usePinThread() {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<ThreadResponse>,
    ErrorResponse,
    PinVariables,
    PinContext
  >({
    mutationFn: ({ id }: PinVariables) => threadsService.togglePin(id),

    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ["threads"] });

      const previousThreads = queryClient.getQueriesData<{
        data: PaginatedThreadsResponse;
      }>({ queryKey: ["threads"] });

      // Get current pin state to toggle
      let currentIsPinned = false;
      for (const [, data] of previousThreads) {
        const thread = data?.data.items.find((t) => t.id === id);
        if (thread) {
          currentIsPinned = thread.is_pinned ?? false;
          break;
        }
      }

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
              items: old.data.items.map((thread) =>
                thread.id === id
                  ? { ...thread, is_pinned: !currentIsPinned }
                  : thread
              ),
            },
          };
        }
      );

      return { previousThreads };
    },

    onError: (_error, _variables, context) => {
      if (context?.previousThreads) {
        for (const [queryKey, data] of context.previousThreads) {
          queryClient.setQueryData(queryKey as string[], data);
        }
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["threads"] });
    },
  });
}
