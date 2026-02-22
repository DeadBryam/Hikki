import { api } from "@/lib/api/api";
import type { Message } from "@/lib/types/chat";

export interface GetMessagesParams {
  limit: number;
  offset: number;
  threadId: string;
}

export async function getMessages(
  params: GetMessagesParams
): Promise<Message[]> {
  const { threadId, limit, offset } = params;

  if (!threadId) {
    return [];
  }

  const response = await api
    .get(`api/v1/threads/${threadId}/messages`, {
      searchParams: { limit, offset },
    })
    .json<{ data: Message[] }>();

  return response.data;
}
