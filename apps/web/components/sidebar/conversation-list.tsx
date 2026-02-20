import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { groupConversationsByDate } from "@/lib/mock/mock-data";
import { staggerContainerVariants } from "@/lib/utils/animations";
import type { Conversation } from "./conversation-item";
import { ConversationItem } from "./conversation-item";

interface ConversationListProps {
  activeConversation: string | undefined;
  conversations: Conversation[];
  isLoading: boolean;
  isOpen: boolean;
  onArchive: (e: React.MouseEvent, id: string) => void;
  onConversationClick: (id: string) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
}

export function ConversationList({
  isOpen,
  isLoading,
  conversations,
  activeConversation,
  onConversationClick,
  onArchive,
  onDelete,
}: ConversationListProps) {
  const groupedConversations = groupConversationsByDate(conversations);

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
                  onArchive={(e) => onArchive(e, conversation.id)}
                  onClick={() => onConversationClick(conversation.id)}
                  onDelete={(e) => onDelete(e, conversation.id)}
                />
              ))}
            </div>
          ))}
        </motion.div>
      )}
    </ScrollArea>
  );
}
