import {
  Archive,
  ArchiveRestore,
  MessageSquare,
  Pin,
  PinOff,
  Trash2,
} from "lucide-react";
import { Tooltip } from "react-tooltip";
import { TruncatedText } from "@/components/ui/truncated-text";
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
  const baseId = `conv-${conversation.id}`;

  return (
    <button
      className={cn(
        "group relative flex w-full cursor-pointer items-center gap-2 overflow-hidden rounded-lg p-2 text-left text-sm transition-all duration-200",
        isActive
          ? "bg-primary/10 text-primary"
          : "border-transparent border-l-2 text-foreground hover:bg-muted/50",
        !isOpen && "justify-center px-1"
      )}
      data-tooltip-content={isOpen ? undefined : conversation.title}
      data-tooltip-id={isOpen ? undefined : `${baseId}-title`}
      data-tooltip-place="right"
      onClick={onClick}
      type="button"
    >
      <MessageSquare
        className={cn("h-4 w-4 shrink-0", isActive && "text-primary")}
      />

      {isOpen && (
        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="flex items-center gap-1">
            <TruncatedText
              className="font-medium"
              maxLength={15}
              text={conversation.title}
              tooltipId={`${baseId}-title`}
              tooltipPlace="top"
            />
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
              data-tooltip-content={
                conversation.is_pinned
                  ? "Unpin conversation"
                  : "Pin conversation"
              }
              data-tooltip-id={`${baseId}-pin`}
              data-tooltip-place="top"
              onClick={(e) => onPin(e)}
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
            data-tooltip-content={
              isArchivedView ? "Unarchive conversation" : "Archive conversation"
            }
            data-tooltip-id={`${baseId}-archive`}
            data-tooltip-place="top"
            onClick={(e) => onArchive(e)}
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
            data-tooltip-content="Delete conversation"
            data-tooltip-id={`${baseId}-delete`}
            data-tooltip-place="top"
            onClick={(e) => onDelete(e)}
            type="button"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-red-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      {/* Tooltips with custom styles */}
      {!isOpen && (
        <Tooltip
          className="!rounded-lg !border !border-border/50 !bg-popover !px-3 !py-2 !text-sm !text-popover-foreground !shadow-lg !max-w-xs"
          id={`${baseId}-title`}
        />
      )}
      <Tooltip
        className="!rounded-lg !border !border-border/50 !bg-popover !px-3 !py-2 !text-sm !text-popover-foreground !shadow-lg"
        id={`${baseId}-pin`}
      />
      <Tooltip
        className="!rounded-lg !border !border-border/50 !bg-popover !px-3 !py-2 !text-sm !text-popover-foreground !shadow-lg"
        id={`${baseId}-archive`}
      />
      <Tooltip
        className="!rounded-lg !border !border-border/50 !bg-popover !px-3 !py-2 !text-sm !text-popover-foreground !shadow-lg"
        id={`${baseId}-delete`}
      />
    </button>
  );
}
