import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { AuthUser } from "@/lib/services/auth-service";

interface SidebarFooterProps {
  isLoggingOut: boolean;
  isOpen: boolean;
  onLogout: () => void;
  user: AuthUser | null;
}

export function SidebarFooter({
  isOpen,
  user,
  isLoggingOut,
  onLogout,
}: SidebarFooterProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <div className="border-border border-t p-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-linear-to-br from-red-400 to-orange-400 font-bold text-white text-xs">
              {user?.username?.charAt(0).toUpperCase() || "H"}
            </AvatarFallback>
          </Avatar>
          {isOpen && (
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-sm">
                {user?.name || "User"}
              </p>
              <p className="truncate text-muted-foreground text-xs">
                {user?.email || "No email"}
              </p>
            </div>
          )}
          {isOpen ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  disabled={isLoggingOut}
                  onClick={onLogout}
                  size="icon"
                  variant="ghost"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Logout</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  disabled={isLoggingOut}
                  onClick={onLogout}
                  size="icon"
                  variant="ghost"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Logout</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
