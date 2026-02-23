"use client";

import { motion } from "framer-motion";
import { Copy, RotateCcw, Sparkles, ThumbsDown, ThumbsUp } from "lucide-react";
import { Else, If, Then } from "react-if";
import MarkdownViewer from "@/components/shared/markdown-viewer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import type { Message } from "@/lib/types/chat";
import { cardHoverVariants } from "@/lib/utils/animations";
import { cn } from "@/lib/utils/misc";
import { TypingIndicator } from "./typing-indicator";

interface MessageBubbleProps {
  message: Message;
}

const COMMAND_REGEX = /^\/(\w+)\s*\|\s*(.*)$/;

/**
 * Extracts command and content from user message
 * @example "/memory | me gusta el rojo" → { command: "memory", content: "me gusta el rojo" }
 */
function parseUserCommand(content: string): {
  command?: string;
  content: string;
} {
  const match = content.match(COMMAND_REGEX);
  if (match) {
    return {
      command: match[1],
      content: match[2].trim(),
    };
  }
  return { content };
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";
  const { command, content: displayContent } = isUser
    ? parseUserCommand(message.content)
    : { command: undefined, content: message.content };

  return (
    <motion.div
      className={cn(
        "group flex gap-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
      initial="rest"
      variants={cardHoverVariants}
      whileHover="hover"
    >
      {/* Avatar */}
      <div className="shrink-0">
        {isUser ? (
          <Avatar className="h-8 w-8 shadow-sm">
            <AvatarFallback className="font-bold text-white text-xs">
              U
            </AvatarFallback>
          </Avatar>
        ) : (
          <Avatar className="flex h-8 w-8 items-center justify-center rounded-full shadow-lg shadow-rose-500/20">
            <Sparkles className="h-4 w-4 text-white" />
          </Avatar>
        )}
      </div>

      {/* Message content */}
      <div
        className={cn("min-w-0 flex-1", isUser && "flex flex-col items-end")}
      >
        {/* Header */}
        <div className="mb-1 flex items-center gap-2">
          <span className="font-medium text-sm">{isUser ? "Tú" : "Hikki"}</span>
          {message.model && (
            <span className="text-muted-foreground text-xs">
              • {message.model}
            </span>
          )}
        </div>

        {/* Bubble */}
        <div
          className={cn(
            "relative w-fit max-w-[85%] rounded-2xl px-4 py-3 shadow-sm md:max-w-[75%]",
            isUser
              ? "ml-auto border border-rose-500/20 bg-linear-to-br from-rose-500/20 to-orange-500/20"
              : "border border-border/50 bg-card"
          )}
        >
          {/* Command chip for user messages */}
          {isUser && command && (
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-rose-500/30 px-2.5 py-1 font-medium text-rose-100 text-xs">
              <span className="text-rose-300">/</span>
              <span>{command}</span>
            </div>
          )}

          {/* Message text with markdown-like formatting */}
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            <If condition={Boolean(displayContent.trim())}>
              <Then>
                <MarkdownViewer content={displayContent} />
              </Then>
              <Else>
                <TypingIndicator />
              </Else>
            </If>
          </div>

          {/* Hover actions for assistant messages */}
          {isAssistant && (
            <motion.div
              animate={{ y: 0 }}
              className="absolute -bottom-8 left-0 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100"
              initial={{ y: -5 }}
            >
              <Button
                className="h-7 w-7 rounded-md"
                data-tooltip-content="Copy"
                data-tooltip-id="action-copy"
                data-tooltip-place="bottom"
                size="icon"
                variant="ghost"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Tooltip delayShow={200} id="action-copy" />

              <Button
                className="h-7 w-7 rounded-md"
                data-tooltip-content="Helpful"
                data-tooltip-id="action-helpful"
                data-tooltip-place="bottom"
                size="icon"
                variant="ghost"
              >
                <ThumbsUp className="h-3.5 w-3.5" />
              </Button>
              <Tooltip delayShow={200} id="action-helpful" />

              <Button
                className="h-7 w-7 rounded-md"
                data-tooltip-content="Not helpful"
                data-tooltip-id="action-unhelpful"
                data-tooltip-place="bottom"
                size="icon"
                variant="ghost"
              >
                <ThumbsDown className="h-3.5 w-3.5" />
              </Button>
              <Tooltip delayShow={200} id="action-unhelpful" />

              <Button
                className="h-7 w-7 rounded-md"
                data-tooltip-content="Regenerate"
                data-tooltip-id="action-regenerate"
                data-tooltip-place="bottom"
                size="icon"
                variant="ghost"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
              <Tooltip delayShow={200} id="action-regenerate" />
            </motion.div>
          )}
        </div>

        {/* Timestamp */}
        <span className="mt-1 text-muted-foreground/60 text-xs">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </motion.div>
  );
}
