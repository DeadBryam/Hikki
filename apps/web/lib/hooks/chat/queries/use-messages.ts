import { useQuery } from "@tanstack/react-query";
import type { Message } from "@/lib/types/chat";

export const getMessagesKey = (threadId: string | undefined) =>
  ["messages", threadId] as const;

export function useMessages(threadId: string | undefined) {
  return useQuery<Message[]>({
    queryKey: getMessagesKey(threadId),
    initialData: [],
    staleTime: Number.POSITIVE_INFINITY,
  });
}
