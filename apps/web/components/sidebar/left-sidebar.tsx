"use client";

import { motion } from "framer-motion";
import {
  LogOut,
  MessageSquare,
  PanelLeft,
  Pin,
  Plus,
  Sparkles,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/lib/hooks/use-auth";
import {
  formatRelativeTime,
  groupConversationsByDate,
  mockConversations,
} from "@/lib/mock/mock-data";
import { authService } from "@/lib/services/auth-service";
import {
  listItemVariants,
  sidebarVariants,
  staggerContainerVariants,
} from "@/lib/utils/animations";
import { env } from "@/lib/utils/env";
import { cn } from "@/lib/utils/misc";
import { toast } from "@/lib/utils/toast";

export function LeftSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const params = useParams();
  const { user, logout: logoutFromStore } = useAuth();
  const activeConversation = params?.slug as string | undefined;
  const groupedConversations = groupConversationsByDate(mockConversations);

  const handleConversationClick = (conversationId: string) => {
    router.push(`/chat/${conversationId}`);
  };

  const handleNewChat = () => {
    router.push("/chat");
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
      logoutFromStore();
      toast.success({ description: "Logged out successfully" });
      router.push("/auth/login");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to logout";
      toast.error({ description: errorMessage, title: "Error" });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        animate={isOpen ? "expanded" : "collapsed"}
        className={cn(
          "relative flex h-full shrink-0 flex-col overflow-hidden bg-sidebar/80 backdrop-blur-xl"
        )}
        initial={false}
        variants={sidebarVariants}
      >
        {/* Header */}
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
                  onClick={handleNewChat}
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
                  onClick={() => setIsOpen((prev) => !prev)}
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

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          <motion.div
            animate="visible"
            className="space-y-4 p-2"
            initial="hidden"
            variants={staggerContainerVariants}
          >
            {groupedConversations.map(([group, conversations]) => (
              <div className="space-y-1" key={group}>
                {isOpen && (
                  <h3 className="px-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                    {group}
                  </h3>
                )}

                {conversations.map((conversation) => (
                  <Tooltip key={conversation.id}>
                    <TooltipTrigger asChild>
                      <motion.button
                        className={cn(
                          "group relative flex w-full items-center gap-2 overflow-hidden rounded-lg p-2 text-left text-sm transition-all duration-200",
                          activeConversation === conversation.id
                            ? "bg-primary/10 text-primary"
                            : "border-transparent border-l-2 text-foreground hover:bg-muted/50",
                          !isOpen && "justify-center px-1"
                        )}
                        onClick={() => handleConversationClick(conversation.id)}
                        variants={listItemVariants}
                      >
                        <MessageSquare
                          className={cn(
                            "h-4 w-4 shrink-0",
                            activeConversation === conversation.id &&
                              "text-primary"
                          )}
                        />

                        {isOpen && (
                          <div className="min-w-0 flex-1 overflow-hidden">
                            <div className="flex items-center gap-1">
                              <span className="truncate font-medium">
                                {conversation.title}
                              </span>
                              {conversation.isPinned && (
                                <Pin className="h-3 w-3 shrink-0 text-amber-400" />
                              )}
                            </div>
                            <p className="truncate text-muted-foreground text-xs">
                              {formatRelativeTime(conversation.date)} •{" "}
                              {conversation.messageCount} messages
                            </p>
                          </div>
                        )}

                        {/* Hover glow effect */}
                        <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-red-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                      </motion.button>
                    </TooltipTrigger>

                    {!isOpen && (
                      <TooltipContent className="max-w-xs" side="right">
                        <p className="font-medium">{conversation.title}</p>
                        <p className="text-muted-foreground text-xs">
                          {formatRelativeTime(conversation.date)}
                        </p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                ))}
              </div>
            ))}
          </motion.div>
        </ScrollArea>

        {/* Footer */}
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
            {isOpen && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    disabled={isLoggingOut}
                    onClick={handleLogout}
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
            )}
            {!isOpen && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    disabled={isLoggingOut}
                    onClick={handleLogout}
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
      </motion.aside>
    </TooltipProvider>
  );
}
