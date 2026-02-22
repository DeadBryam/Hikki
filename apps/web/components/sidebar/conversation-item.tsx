import {
  Archive,
  ArchiveRestore,
  MessageSquare,
  Pin,
  PinOff,
  Trash2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils/misc";
import { formatRelativeTime } from "@/lib/utils/relative-time";
import type { ThreadResponse } from "@/types/threads";

interface ConversationItemProps {
  conversation: ThreadResponse;
  isActive: boolean;
  isArchivedView?: boolean;
  isOpen: boolean;
  onArchive: (e: React.MouseEvent) => void;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
  onPin?: (e: React.MouseEvent) => void;
}

export function ConversationItem({
  conversation,
  isArchivedView = false,
  isOpen,
  isActive,
  onClick,
  onArchive,
  onDelete,
  onPin,
}: ConversationItemProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={cn(
              "group relative flex w-full cursor-pointer items-center gap-2 overflow-hidden rounded-lg p-2 text-left text-sm transition-all duration-200",
              isActive
                ? "bg-primary/10 text-primary"
                : "border-transparent border-l-2 text-foreground hover:bg-muted/50",
              !isOpen && "justify-center px-1"
            )}
            onClick={onClick}
            type="button"
          >
            <MessageSquare
              className={cn("h-4 w-4 shrink-0", isActive && "text-primary")}
            />

            {isOpen && (
              <div className="min-w-0 flex-1 overflow-hidden">
                <div className="flex items-center gap-1">
                  <span className="truncate font-medium">
                    {conversation.title}
                  </span>
                  {conversation.is_pinned && (
                    <Pin className="h-3 w-3 shrink-0 text-amber-400" />
                  )}
                </div>
                <p className="truncate text-muted-foreground text-xs">
                  {formatRelativeTime(conversation.created_at)} •{" "}
                  {conversation.messages_count} messages
                </p>
              </div>
            )}

            {isOpen && (
              <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                {!isArchivedView && onPin && (
                  <button
                    className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md hover:bg-muted"
                    onClick={(e) => onPin(e)}
                    title={
                      conversation.is_pinned
                        ? "Unpin conversation"
                        : "Pin conversation"
                    }
                    type="button"
                  >
                    {conversation.is_pinned ? (
                      <PinOff className="h-3 w-3" />
                    ) : (
                      <Pin className="h-3 w-3" />
                    )}
                  </button>
                )}
                <button
                  className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md hover:bg-muted"
                  onClick={(e) => onArchive(e)}
                  title={
                    isArchivedView
                      ? "Unarchive conversation"
                      : "Archive conversation"
                  }
                  type="button"
                >
                  {isArchivedView ? (
                    <ArchiveRestore className="h-3 w-3" />
                  ) : (
                    <Archive className="h-3 w-3" />
                  )}
                </button>
                <button
                  className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md hover:bg-muted"
                  onClick={(e) => onDelete(e)}
                  title="Delete conversation"
                  type="button"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            )}

            <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-red-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        </TooltipTrigger>

        {!isOpen && (
          <TooltipContent className="max-w-xs" side="right">
            <p className="font-medium">{conversation.title}</p>
            <p className="text-muted-foreground text-xs">
              {formatRelativeTime(conversation.created_at)}
            </p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
