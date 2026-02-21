"use client";

import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useTransitionRouter } from "next-view-transitions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useArchiveThread } from "@/lib/hooks/threads/mutations/use-archive-thread";
import { useDeleteThread } from "@/lib/hooks/threads/mutations/use-delete-thread";
import { useThreads } from "@/lib/hooks/threads/queries/use-threads";
import { staggerContainerVariants } from "@/lib/utils/animations";
import displayErrorsFromServer from "@/lib/utils/display-error";
import { groupThreadsByDate } from "@/lib/utils/group-threads-by-date";
import { toast } from "@/lib/utils/toast";
import { ConversationItem } from "./conversation-item";

interface ConversationListProps {
  isOpen: boolean;
  searchQuery?: string;
  showArchived?: boolean;
}

export function ConversationList({
  isOpen,
  searchQuery = "",
  showArchived = false,
}: ConversationListProps) {
  const params = useParams();
  const router = useTransitionRouter();
  const nextRouter = useRouter();

  const activeConversation = params?.slug as string | undefined;

  const { data: threadsData, isLoading } = useThreads({
    search: searchQuery || undefined,
    archived: showArchived,
    sort: "updated_at",
    order: "desc",
  });

  const archiveThread = useArchiveThread();
  const deleteThread = useDeleteThread();

  const threads = threadsData?.data?.items || [];
  const groupedConversations = groupThreadsByDate(threads);

  const handleConversationClick = (conversationId: string) => {
    router.push(`/chat/${conversationId}`);
  };

  const handleArchive = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    archiveThread.mutate(id, {
      onSuccess: () => {
        toast.success({ description: "Conversation archived successfully" });
        if (activeConversation === id) {
          nextRouter.push("/chat");
        }
      },
      onError: (error) => displayErrorsFromServer(error),
    });
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteThread.mutate(id, {
      onSuccess: () => {
        toast.success({ description: "Conversation deleted successfully" });
        if (activeConversation === id) {
          nextRouter.push("/chat");
        }
      },
      onError: (error) => displayErrorsFromServer(error),
    });
  };

  return (
    <ScrollArea className="flex-1">
      {isLoading ? (
        <div className="flex items-center justify-center p-4">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <motion.div
          animate="visible"
          className="space-y-4 p-2"
          initial="hidden"
          variants={staggerContainerVariants}
        >
          {groupedConversations.map(([group, items]) => (
            <div className="space-y-1" key={group}>
              {isOpen && (
                <h3 className="px-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                  {group}
                </h3>
              )}

              {items.map((conversation) => (
                <ConversationItem
                  conversation={conversation}
                  isActive={activeConversation === conversation.id}
                  isOpen={isOpen}
                  key={conversation.id}
                  onArchive={(e) => handleArchive(e, conversation.id)}
                  onClick={() => handleConversationClick(conversation.id)}
                  onDelete={(e) => handleDelete(e, conversation.id)}
                />
              ))}
            </div>
          ))}
        </motion.div>
      )}
    </ScrollArea>
  );
}
