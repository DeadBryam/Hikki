"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { messageVariants } from "@/lib/animations";
import { type Message, mockMessagesByConversation } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { EmptyState } from "./empty-state";
import { MessageBubble } from "./message-bubble";
import { MessageInput } from "./message-input";
import { TypingIndicator } from "./typing-indicator";

interface ChatContainerProps {
  conversationId?: string;
}

export function ChatContainer({ conversationId }: ChatContainerProps) {
  const [messages, setMessages] = useState<Message[]>(
    conversationId ? mockMessagesByConversation[conversationId] || [] : []
  );
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isEmpty = messages.length === 0;

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  const handleSendMessage = (content: string) => {
    if (!content.trim()) {
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Entiendo tu mensaje sobre "${content.slice(0, 30)}...". Esto es una respuesta simulada mientras implementamos la integración completa con el API.`,
        timestamp: new Date(),
        model: "gemini-pro",
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
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

                  {isTyping && (
                    <motion.div
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      initial={{ opacity: 0, y: 10 }}
                    >
                      <TypingIndicator />
                    </motion.div>
                  )}

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
