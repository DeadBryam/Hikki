import { PanelLeft, Plus, Sparkles } from "lucide-react";
import { Link } from "next-view-transitions";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { env } from "@/lib/utils/env";
import { cn } from "@/lib/utils/misc";

interface SidebarHeaderProps {
  isOpen: boolean;
  onNewChat: () => void;
  onToggle: () => void;
}

export function SidebarHeader({
  isOpen,
  onNewChat,
  onToggle,
}: SidebarHeaderProps) {
  return (
    <div className="flex items-center justify-between p-3">
      <Link
        className={cn("flex items-center gap-2 overflow-hidden", {
          invisible: !isOpen,
        })}
        href="/"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-rose-500 to-orange-500">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <span className="whitespace-nowrap font-semibold text-sm">
          {env.APP_NAME}
        </span>
      </Link>

      <div
        className={cn(
          "flex items-center gap-1",
          isOpen ? "flex-row" : "flex-col-reverse"
        )}
      >
        <Button
          className="h-8 w-8 shrink-0"
          data-tooltip-content="New chat"
          data-tooltip-id="btn-new-chat"
          data-tooltip-place="bottom"
          onClick={onNewChat}
          size="icon"
          variant="ghost"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Tooltip id="btn-new-chat" />
        <Button
          className="h-8 w-8 shrink-0"
          data-tooltip-content={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          data-tooltip-id="btn-toggle"
          data-tooltip-place="bottom"
          onClick={onToggle}
          size="icon"
          variant="ghost"
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
        <Tooltip id="btn-toggle" />
      </div>
    </div>
  );
}
