"use client";

import { motion } from "framer-motion";
import { Copy, RotateCcw, Sparkles, ThumbsDown, ThumbsUp } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cardHoverVariants } from "@/lib/animations";
import type { Message } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

  return (
    <TooltipProvider delayDuration={200}>
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
            <Avatar className="h-8 w-8 border-2 border-red-500/20">
              <AvatarFallback className="bg-gradient-to-br from-red-400 to-orange-400 font-bold text-white text-xs">
                U
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-500 shadow-lg shadow-red-500/20">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
          )}
        </div>

        {/* Message content */}
        <div
          className={cn("min-w-0 flex-1", isUser && "flex flex-col items-end")}
        >
          {/* Header */}
          <div className="mb-1 flex items-center gap-2">
            <span className="font-medium text-sm">
              {isUser ? "Tú" : "Hikki"}
            </span>
            {message.model && (
              <span className="text-muted-foreground text-xs">
                • {message.model}
              </span>
            )}
          </div>

          {/* Bubble */}
          <div
            className={cn(
              "relative max-w-[85%] rounded-2xl px-4 py-3 md:max-w-[75%]",
              isUser
                ? "ml-auto border border-red-500/20 bg-gradient-to-br from-red-500/20 to-orange-500/20"
                : "border border-border/50 bg-card"
            )}
          >
            {/* Message text with markdown-like formatting */}
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              <FormattedContent content={message.content} />
            </div>

            {/* Hover actions for assistant messages */}
            {isAssistant && (
              <motion.div
                animate={{ y: 0 }}
                className="absolute -bottom-8 left-0 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100"
                initial={{ y: -5 }}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="h-7 w-7 rounded-md"
                      size="icon"
                      variant="ghost"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="h-7 w-7 rounded-md"
                      size="icon"
                      variant="ghost"
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Helpful</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="h-7 w-7 rounded-md"
                      size="icon"
                      variant="ghost"
                    >
                      <ThumbsDown className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Not helpful</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="h-7 w-7 rounded-md"
                      size="icon"
                      variant="ghost"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Regenerate</p>
                  </TooltipContent>
                </Tooltip>
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
    </TooltipProvider>
  );
}

function FormattedContent({ content }: { content: string }) {
  const parts = content.split(/(\*\*.*?\*\*|`.*?`)/g);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong className="font-semibold text-foreground" key={index}>
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs"
              key={index}
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}
