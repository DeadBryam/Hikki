"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { Case, Default, Switch } from "react-if";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSendMessage } from "@/lib/hooks/chat/mutations/use-send-message";
import { useMessages } from "@/lib/hooks/chat/queries/use-messages";
import { useLimits } from "@/lib/hooks/use-limits";
import { cn } from "@/lib/utils/misc";
import { EmptyState } from "./empty-state";
import { MessageBubble } from "./message-bubble";
import { MessageInput } from "./message-input";
import { MessageSkeleton } from "./message-skeleton";

interface ChatContainerProps {
  conversationId?: string;
}

const messageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function ChatContainer({ conversationId }: ChatContainerProps) {
  const { data: messages = [], isPending } = useMessages(conversationId);
  const { data: limits } = useLimits();

  const scrollRef = useRef<HTMLDivElement>(null);
  const prevMessageCount = useRef(messages.length);

  const sendMessageMutation = useSendMessage(conversationId);

  const isEmpty = messages.length === 0;
  const isTyping = messages.some((m) => m.isStreaming);

  const maxMessageLength = limits?.maxMessageLength ?? 4000;
  const maxMessages = limits?.maxMessages ?? 10;

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
        "relative flex h-full flex-col bg-linear-to-b from-background via-card/30 to-background",
        isEmpty && "items-center justify-center"
      )}
    >
      {/* Messages Area */}
      <div
        className={cn(
          "relative my-5 overflow-hidden",
          isEmpty ? "h-auto" : "flex-1"
        )}
      >
        {/* Subtle Pattern Background */}
        <div className="chat-bg-pattern absolute inset-0 opacity-40" />

        {/* Top Gradient Fade */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-12 bg-linear-to-b from-background to-transparent" />

        <AnimatePresence mode="wait">
          <Switch>
            <Case condition={isPending}>
              <motion.div
                animate={{ opacity: 1 }}
                className="h-full"
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                key="loading"
                transition={{ duration: 0.3 }}
              >
                <MessageSkeleton />
              </motion.div>
            </Case>

            <Case condition={isEmpty}>
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
            </Case>

            <Default>
              <motion.div
                animate={{ opacity: 1 }}
                className="h-full"
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                key="chat"
                transition={{ duration: 0.3 }}
              >
                <ScrollArea className="h-full" ref={scrollRef}>
                  <div className="mx-auto max-w-3xl space-y-6 px-6 py-10">
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
            </Default>
          </Switch>
        </AnimatePresence>
      </div>

      {/* Input Area with Glass Effect */}
      <div
        className={cn(
          "w-full border-border/30 p-4 backdrop-blur-xl",
          isEmpty ? "relative" : "absolute right-0 bottom-0 left-0"
        )}
      >
        <div className={cn("mx-auto max-w-3xl", isEmpty && "w-full")}>
          <MessageInput
            isCentered={isEmpty}
            isLoading={isTyping}
            maxMessageLength={maxMessageLength}
            maxMessages={maxMessages}
            messageCount={messages.length}
            onSend={handleSendMessage}
          />
        </div>
      </div>
    </div>
  );
}
