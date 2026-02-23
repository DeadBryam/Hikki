"use client";

import { motion } from "framer-motion";
import { Brain, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDeleteMemory } from "@/lib/hooks/memories/mutations/use-memory-mutations";
import { useMemories } from "@/lib/hooks/memories/queries/use-memories";
import { useMemorySSE } from "@/lib/hooks/memories/use-memory-sse";
import { cardHoverVariants } from "@/lib/utils/animations";

export function MemoriesTab() {
  // Enable SSE for real-time updates
  useMemorySSE();

  const { data, isLoading } = useMemories();
  const { mutate: deleteMemory } = useDeleteMemory();

  const handleDeleteMemory = (id: string) => {
    deleteMemory(id);
  };

  const memories = data?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (memories.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground text-sm">
        <Brain className="mx-auto mb-2 h-8 w-8 opacity-50" />
        <p>No memories yet</p>
        <p className="mt-1 text-xs">Use /memory in chat to save something</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {memories?.map((memory) => (
        <motion.div
          className="group relative cursor-pointer overflow-hidden rounded-xl border border-border/50 bg-card p-3"
          initial="rest"
          key={memory.id}
          variants={cardHoverVariants}
          whileHover="hover"
        >
          <p className="mb-2 pr-8 text-sm leading-relaxed">{memory.content}</p>

          <div className="flex flex-wrap items-center gap-1">
            <Badge className="h-4 px-1.5 py-0 text-[10px]" variant="secondary">
              {memory.type}
            </Badge>
          </div>

          <p className="mt-2 text-muted-foreground text-xs">
            {new Date(memory.created_at).toLocaleDateString()}
          </p>

          <Button
            className="absolute top-2 right-2 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteMemory(memory.id);
            }}
            size="icon"
            variant="ghost"
          >
            <Trash2 className="h-3 w-3 text-rose-500" />
          </Button>

          <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-rose-500/5 via-transparent to-cyan-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
        </motion.div>
      ))}
    </div>
  );
}
