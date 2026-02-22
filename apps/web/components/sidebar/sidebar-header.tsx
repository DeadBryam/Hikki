import { motion } from "framer-motion";
import { PanelLeft, Plus, Sparkles } from "lucide-react";
import { Tooltip } from "react-tooltip";
import { Button } from "@/components/ui/button";
import { env } from "@/lib/utils/env";

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
      <motion.div
        animate={{ opacity: isOpen ? 1 : 0 }}
        className="flex items-center gap-2 overflow-hidden"
        transition={{ type: "spring" }}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-rose-500 to-orange-500">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        {isOpen && (
          <span className="whitespace-nowrap font-semibold text-sm">
            {env.APP_NAME}
          </span>
        )}
      </motion.div>

      <div className="flex items-center gap-1">
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
        <Tooltip
          className="!rounded-lg !border !border-border/50 !bg-popover !px-3 !py-2 !text-sm !text-popover-foreground !shadow-lg"
          id="btn-new-chat"
        />

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
        <Tooltip
          className="!rounded-lg !border !border-border/50 !bg-popover !px-3 !py-2 !text-sm !text-popover-foreground !shadow-lg"
          id="btn-toggle"
        />
      </div>
    </div>
  );
}
