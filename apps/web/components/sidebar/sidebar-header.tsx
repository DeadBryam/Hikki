import { motion } from "framer-motion";
import { PanelLeft, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
    <TooltipProvider delayDuration={0}>
      <div className="flex items-center justify-between p-3">
        <motion.div
          animate={{ opacity: isOpen ? 1 : 0 }}
          className="flex items-center gap-2 overflow-hidden"
          transition={{ type: "spring" }}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-red-500 to-orange-500">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          {isOpen && (
            <span className="whitespace-nowrap font-semibold text-sm">
              {env.APP_NAME}
            </span>
          )}
        </motion.div>

        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="h-8 w-8 shrink-0"
                onClick={onNewChat}
                size="icon"
                variant="ghost"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>New chat</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="h-8 w-8 shrink-0"
                onClick={onToggle}
                size="icon"
                variant="ghost"
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{isOpen ? "Collapse sidebar" : "Expand sidebar"}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
