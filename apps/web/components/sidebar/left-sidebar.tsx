"use client";

import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { useTransitionRouter } from "next-view-transitions";
import type React from "react";
import { useState } from "react";
import { useArchiveThread } from "@/lib/hooks/threads/mutations/use-archive-thread";
import { useCreateThread } from "@/lib/hooks/threads/mutations/use-create-thread";
import { useDeleteThread } from "@/lib/hooks/threads/mutations/use-delete-thread";
import { useThreads } from "@/lib/hooks/threads/queries/use-threads";
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
  const params = useParams();
  const { user, logout: logoutFromStore } = useAuth();
  const activeConversation = params?.slug as string | undefined;

  const { data: threadsData, isLoading: isLoadingThreads } = useThreads({
    search: searchQuery || undefined,
    archived: showArchived,
    sort: "updated_at",
    order: "desc",
  });

  const createThread = useCreateThread();
  const deleteThread = useDeleteThread();
  const archiveThread = useArchiveThread();

  const threads = threadsData?.data;
  const rawConversations = Array.isArray(threads) ? threads : [];
  const conversations = rawConversations.map((t) => ({
    id: t.id,
    title: t.title,
    date: t.updated_at,
    messageCount: t.messages_count ?? 0,
    isPinned: t.is_pinned,
  }));

  const handleConversationClick = (conversationId: string) => {
    router.push(`/chat/${conversationId}`);
  };

  const handleNewChat = () => {
    createThread.mutate(undefined);
  };

  const handleDeleteThread = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteThread.mutate(id);
    if (activeConversation === id) {
      router.push("/chat");
    }
  };

  const handleArchiveThread = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    archiveThread.mutate(id);
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
        activeConversation={activeConversation}
        conversations={conversations}
        isLoading={isLoadingThreads}
        isOpen={isOpen}
        onArchive={handleArchiveThread}
        onConversationClick={handleConversationClick}
        onDelete={handleDeleteThread}
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
