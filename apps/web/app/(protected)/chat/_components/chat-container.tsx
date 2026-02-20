"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSendMessage } from "@/lib/hooks/chat/mutations/use-send-message";
import { useMessages } from "@/lib/hooks/chat/queries/use-messages";
import { messageVariants } from "@/lib/utils/animations";
import { cn } from "@/lib/utils/misc";
import { EmptyState } from "./empty-state";
import { MessageBubble } from "./message-bubble";
import { MessageInput } from "./message-input";

interface ChatContainerProps {
  conversationId?: string;
}

export function ChatContainer({ conversationId }: ChatContainerProps) {
  const { data: messages = [] } = useMessages(conversationId);

  const scrollRef = useRef<HTMLDivElement>(null);
  const prevMessageCount = useRef(messages.length);

  const sendMessageMutation = useSendMessage(conversationId);

  const isEmpty = messages.length === 0;
  const isTyping = messages.some((m) => m.isStreaming);

  useEffect(() => {
    if (prevMessageCount.current !== messages.length && scrollRef.current) {
      prevMessageCount.current = messages.length;
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  });

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) {
      return;
    }

    await sendMessageMutation.mutateAsync({
      question: content,
    });
  };

  const handleSuggestionClick = (prompt: string) => {
    handleSendMessage(prompt);
  };

  return (
    <div
      className={cn(
        "relative flex h-full flex-col",
        isEmpty && "items-center justify-center"
      )}
    >
      {/* Messages Area */}
      <div
        className={cn(
          "relative overflow-hidden",
          isEmpty ? "h-auto" : "flex-1"
        )}
      >
        <AnimatePresence mode="wait">
          {isEmpty ? (
            <motion.div
              animate={{ opacity: 1 }}
              className="h-full"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              key="empty"
              transition={{ duration: 0.3 }}
            >
              <EmptyState onSuggestionClick={handleSuggestionClick} />
            </motion.div>
          ) : (
            <motion.div
              animate={{ opacity: 1 }}
              className="h-full"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              key="chat"
              transition={{ duration: 0.3 }}
            >
              <ScrollArea className="h-full" ref={scrollRef}>
                <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
                  {messages.map((message) => (
                    <motion.div
                      animate="visible"
                      initial="hidden"
                      key={message.id}
                      variants={messageVariants}
                    >
                      <MessageBubble message={message} />
                    </motion.div>
                  ))}

                  {/* Bottom padding for input */}
                  <div className="h-24" />
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div
        className={cn(
          "w-full p-4",
          isEmpty ? "relative" : "absolute right-0 bottom-0 left-0"
        )}
      >
        <div className={cn("mx-auto max-w-3xl", isEmpty && "w-full")}>
          <MessageInput
            isCentered={isEmpty}
            isLoading={isTyping}
            onSend={handleSendMessage}
          />
        </div>
      </div>
    </div>
  );
}
