"use client";

import { motion } from "framer-motion";
import { useTransitionRouter } from "next-view-transitions";
import { useState } from "react";
import { useCreateThread } from "@/lib/hooks/threads/mutations/use-create-thread";
import { useAuth } from "@/lib/hooks/use-auth";
import { authService } from "@/lib/services/auth-service";
import { sidebarVariants } from "@/lib/utils/animations";
import { cn } from "@/lib/utils/misc";
import { toast } from "@/lib/utils/toast";
import { ConversationList } from "./conversation-list";
import { SidebarFilters } from "./sidebar-filters";
import { SidebarFooter } from "./sidebar-footer";
import { SidebarHeader } from "./sidebar-header";

export function LeftSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const router = useTransitionRouter();
  const { user, logout: logoutFromStore } = useAuth();

  const createThread = useCreateThread();

  const handleNewChat = () => {
    createThread.mutate(undefined);
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
    <motion.aside
      animate={isOpen ? "expanded" : "collapsed"}
      className={cn(
        "relative flex h-full shrink-0 flex-col overflow-hidden bg-sidebar/80 backdrop-blur-xl"
      )}
      initial={false}
      variants={sidebarVariants}
    >
      <SidebarHeader
        isOpen={isOpen}
        onNewChat={handleNewChat}
        onToggle={() => setIsOpen((prev) => !prev)}
      />
      <SidebarFilters
        isOpen={isOpen}
        onArchivedToggle={() => setShowArchived(!showArchived)}
        onSearchChange={setSearchQuery}
        searchQuery={searchQuery}
        showArchived={showArchived}
      />
      <ConversationList
        isOpen={isOpen}
        searchQuery={searchQuery}
        showArchived={showArchived}
      />
      <SidebarFooter
        isLoggingOut={isLoggingOut}
        isOpen={isOpen}
        onLogout={handleLogout}
        user={user}
      />
    </motion.aside>
  );
}
