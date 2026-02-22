import { LogOut } from "lucide-react";
import { Tooltip } from "react-tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
        <Button
          className="h-8 w-8 shrink-0"
          data-tooltip-content="Logout"
          data-tooltip-id="btn-logout"
          data-tooltip-place={isOpen ? "top" : "right"}
          disabled={isLoggingOut}
          onClick={onLogout}
          size="icon"
          variant="ghost"
        >
          <LogOut className="h-4 w-4" />
        </Button>
        <Tooltip
          className="!rounded-lg !border !border-border/50 !bg-popover !px-3 !py-2 !text-sm !text-popover-foreground !shadow-lg"
          id="btn-logout"
        />
      </div>
    </div>
  );
}
