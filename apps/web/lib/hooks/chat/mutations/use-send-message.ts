import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getMessagesKey } from "@/lib/hooks/chat/queries/use-messages";
import type { SendMessageParams } from "@/lib/services/chat-service";
import { chatService } from "@/lib/services/chat-service";
import type { Message } from "@/lib/types/chat";

export function useSendMessage(threadId: string | undefined) {
  const queryClient = useQueryClient();
  const messagesKey = getMessagesKey(threadId);

  return useMutation({
    mutationFn: async (params: SendMessageParams) => {
      const response = await chatService.sendMessage({
        ...params,
        thread: threadId,
      });
      return response;
    },
    onMutate: async (params) => {
      await queryClient.cancelQueries({ queryKey: messagesKey });

      const previousMessages =
        queryClient.getQueryData<Message[]>(messagesKey) || [];

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: params.question,
        timestamp: new Date(),
      };

      const aiMessageId = (Date.now() + 1).toString();
      const aiMessage: Message = {
        id: aiMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
      };

      queryClient.setQueryData<Message[]>(messagesKey, [
        ...previousMessages,
        userMessage,
        aiMessage,
      ]);

      return { aiMessageId, previousMessages, threadId };
    },
    onSuccess: async (data, _variables, context) => {
      const { stream, threadId: newThreadId } = data;
      const { aiMessageId } = context;

      if (newThreadId && newThreadId !== threadId) {
        const currentMessages =
          queryClient.getQueryData<Message[]>(messagesKey) || [];
        queryClient.setQueryData<Message[]>(
          getMessagesKey(newThreadId),
          currentMessages
        );
      }

      const targetKey =
        newThreadId && newThreadId !== threadId
          ? getMessagesKey(newThreadId)
          : messagesKey;

      const reader = stream.getReader();
      let accumulatedContent = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          console.log("Received chunk:", { done, value });
          if (done) {
            break;
          }
          accumulatedContent += value;

          queryClient.setQueryData<Message[]>(targetKey, (old) => {
            if (!old) {
              return old;
            }
            return old.map((msg) =>
              msg.id === aiMessageId
                ? { ...msg, content: accumulatedContent }
                : msg
            );
          });
        }
      } finally {
        reader.releaseLock();
      }

      queryClient.setQueryData<Message[]>(targetKey, (old) => {
        if (!old) {
          return old;
        }
        return old.map((msg) =>
          msg.id === aiMessageId ? { ...msg, isStreaming: false } : msg
        );
      });
    },
    onError: (_error, _variables, context) => {
      if (context?.aiMessageId) {
        queryClient.setQueryData<Message[]>(messagesKey, (old) => {
          if (!old) {
            return old;
          }
          return old.map((msg) =>
            msg.id === context.aiMessageId
              ? {
                  ...msg,
                  content: "Sorry, I encountered an error. Please try again.",
                  isError: true,
                  isStreaming: false,
                }
              : msg
          );
        });
      }
    },
  });
}
