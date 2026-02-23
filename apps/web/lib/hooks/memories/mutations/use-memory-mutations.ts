import { useMutation, useQueryClient } from "@tanstack/react-query";
import { memoryService } from "@/lib/services/memory-service";
import { MEMORIES_KEY } from "../queries/use-memories";

export function useCreateMemory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      content: string;
      type?: "fact" | "personality" | "event" | "other";
      tags?: string[];
    }) => memoryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEMORIES_KEY });
    },
  });
}

export function useDeleteMemory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => memoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEMORIES_KEY });
    },
  });
}
