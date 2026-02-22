import { useQuery } from "@tanstack/react-query";
import { getMessages } from "@/lib/repositories/messages-repository";
import type { Message } from "@/lib/types/chat";

export const getMessagesKey = (threadId: string | undefined) =>
  ["messages", threadId] as const;

const MESSAGES_LIMIT = 10;

export function useMessages(threadId: string | undefined) {
  return useQuery<Message[]>({
    queryKey: getMessagesKey(threadId),
    queryFn: async () => {
      if (!threadId) {
        return [];
      }
      return await getMessages({
        threadId,
        limit: MESSAGES_LIMIT,
        offset: 0,
      });
    },
    staleTime: 1000 * 60,
    enabled: !!threadId,
  });
}
