"use client";

import { motion } from "framer-motion";
import { Mic, Paperclip, Send, Sparkles } from "lucide-react";
import {
  forwardRef,
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSendMessage } from "@/lib/hooks/chat/mutations/use-send-message";
import { useMessages } from "@/lib/hooks/chat/queries/use-messages";
import { useLimits } from "@/lib/hooks/use-limits";
import { inputFocusVariants } from "@/lib/utils/animations";
import { cn } from "@/lib/utils/misc";

interface MessageInputProps {
  conversationId?: string;
}

export interface MessageInputHandle {
  focus: () => void;
}

export const MessageInput = forwardRef<MessageInputHandle, MessageInputProps>(
  function MessageInput({ conversationId }, ref) {
    const [message, setMessage] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const { data: messages = [] } = useMessages(conversationId);
    const { mutate: sendMessage, isPending: isLoading } =
      useSendMessage(conversationId);
    const { data: limits } = useLimits();

    const maxMessageLength = limits?.maxMessageLength ?? 4000;
    const maxMessages = limits?.maxMessages ?? 10;
    const messageCount = messages.length;
    const isCentered = messageCount === 0;

    useImperativeHandle(ref, () => ({
      focus: () => {
        textareaRef.current?.focus();
      },
    }));

    const isOverLimit = message.length > maxMessageLength;

    const handleSend = () => {
      if (!message.trim() || isLoading || isOverLimit) {
        return;
      }
      sendMessage({ question: message });
      setMessage("");

      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    };

    const handleKeyDown = (e: ReactKeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    };

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const target = e.target;
      const value = target.value;

      if (value.length > maxMessageLength) {
        return;
      }

      setMessage(value);

      target.style.height = "auto";
      target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
    };

    useEffect(() => {
      const handleKeyDown = (e: globalThis.KeyboardEvent) => {
        if (
          e.key === "/" &&
          !e.ctrlKey &&
          !e.metaKey &&
          !e.altKey &&
          document.activeElement?.tagName !== "INPUT" &&
          document.activeElement?.tagName !== "TEXTAREA"
        ) {
          e.preventDefault();
          textareaRef.current?.focus();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
      <motion.div
        animate={isFocused ? "focus" : "idle"}
        className={cn(
          "relative overflow-visible rounded-2xl",
          isCentered && "transform"
        )}
        initial={false}
        variants={inputFocusVariants}
      >
        {/* Input container with glassmorphism */}
        <div
          className={cn(
            "relative rounded-2xl border bg-card/50 backdrop-blur-xl transition-all duration-300",
            isCentered ? "shadow-2xl shadow-rose-500/10" : "shadow-lg",
            isFocused
              ? "border-rose-500/50 ring-2 ring-violet-500/20"
              : "border-border/50 hover:border-border"
          )}
        >
          {/* Gradient border effect on focus */}
          {isFocused && (
            <div className="absolute -inset-px rounded-2xl bg-linear-to-r from-rose-500/30 via-cyan-500/20 to-violet-500/30 opacity-50 blur-sm" />
          )}

          <div className="relative p-3">
            {/* Textarea */}
            <Textarea
              className={cn(
                "scrollbar-thin max-h-50 min-h-6 w-full resize-none border-0 bg-transparent px-2 py-2 text-base placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0",
                isCentered && "text-center text-lg md:text-left"
              )}
              disabled={isLoading || isOverLimit}
              onBlur={() => setIsFocused(false)}
              onChange={handleInput}
              onFocus={() => setIsFocused(true)}
              onKeyDown={handleKeyDown}
              placeholder={
                isCentered
                  ? "What can I help you with today?"
                  : "Type your message..."
              }
              ref={textareaRef}
              rows={1}
              value={message}
            />

            {/* Character and message count */}
            <div
              className={cn(
                "absolute right-3 bottom-1 flex gap-2 text-xs transition-colors",
                isOverLimit ? "text-rose-500" : "text-muted-foreground/50"
              )}
            >
              <span>
                {messageCount}/{maxMessages} msg
              </span>
              <span>
                {message.length}/{maxMessageLength}
              </span>
            </div>

            {/* Action buttons */}
            <div className="mt-2 flex items-center justify-between border-border/30 border-t pt-2">
              <div className="flex items-center gap-1">
                <Button
                  className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  disabled={isLoading}
                  size="icon"
                  variant="ghost"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>

                <Button
                  className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  disabled={isLoading}
                  size="icon"
                  variant="ghost"
                >
                  <Mic className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {/* Model indicator */}
                <div className="hidden items-center gap-1.5 rounded-md bg-muted/50 px-2 py-1 text-muted-foreground text-xs md:flex">
                  <Sparkles className="h-3 w-3" />
                  <span>Gemini Pro</span>
                </div>

                {/* Send button */}
                <Button
                  className={cn(
                    "h-9 w-9 rounded-xl transition-all duration-300",
                    message.trim() && !isLoading && !isOverLimit
                      ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/25 hover:from-rose-600 hover:to-orange-600"
                      : "bg-muted text-muted-foreground"
                  )}
                  disabled={!message.trim() || isLoading || isOverLimit}
                  onClick={handleSend}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
);
