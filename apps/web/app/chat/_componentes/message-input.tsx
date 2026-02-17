"use client";

import { motion } from "framer-motion";
import { Mic, Paperclip, Send, Sparkles } from "lucide-react";
import { type KeyboardEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { inputFocusVariants } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  isCentered?: boolean;
  isLoading?: boolean;
  onSend: (message: string) => void;
}

export function MessageInput({
  onSend,
  isLoading,
  isCentered,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!message.trim() || isLoading) {
      return;
    }
    onSend(message);
    setMessage("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target;
    setMessage(target.value);

    // Auto-resize textarea
    target.style.height = "auto";
    target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
  };

  return (
    <motion.div
      animate={isFocused ? "focus" : "idle"}
      className={cn("relative", isCentered && "transform")}
      initial={false}
      variants={inputFocusVariants}
    >
      {/* Input container with glassmorphism */}
      <div
        className={cn(
          "relative rounded-2xl border bg-card/50 backdrop-blur-xl transition-all duration-300",
          isCentered ? "shadow-2xl shadow-red-500/10" : "shadow-lg",
          isFocused
            ? "border-red-500/50 ring-2 ring-violet-500/20"
            : "border-border/50 hover:border-border"
        )}
      >
        {/* Gradient border effect on focus */}
        {isFocused && (
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-red-500/30 via-cyan-500/20 to-violet-500/30 opacity-50 blur-sm" />
        )}

        <div className="relative p-3">
          {/* Textarea */}
          <Textarea
            className={cn(
              "scrollbar-thin max-h-[200px] min-h-[24px] w-full resize-none border-0 bg-transparent px-2 py-2 text-base placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0",
              isCentered && "text-center text-lg md:text-left"
            )}
            disabled={isLoading}
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
                  message.trim() && !isLoading
                    ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/25 hover:from-red-600 hover:to-orange-600"
                    : "bg-muted text-muted-foreground"
                )}
                disabled={!message.trim() || isLoading}
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
