"use client";

import { motion } from "framer-motion";
import { Bell, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useReminders } from "@/lib/hooks/reminders/queries/use-reminders";
import { cardHoverVariants } from "@/lib/utils/animations";
import { cn } from "@/lib/utils/misc";

export function RemindersTab() {
  const { data, isLoading, refetch } = useReminders();

  const reminders = data?.data || [];

  const handleDelete = async (id: string) => {
    const { reminderService } = await import("@/lib/services/reminder-service");
    await reminderService.delete(id);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (reminders.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground text-sm">
        <Bell className="mx-auto mb-2 h-8 w-8 opacity-50" />
        <p>No reminders</p>
        <p className="mt-1 text-xs">Use /remindme in chat to create one</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {reminders.map((reminder) => (
        <motion.div
          className="group relative cursor-pointer overflow-hidden rounded-xl border border-border/50 bg-card p-3"
          initial="rest"
          key={reminder.id}
          variants={cardHoverVariants}
          whileHover="hover"
        >
          <p className="mb-2 pr-8 text-sm leading-relaxed">
            {reminder.message}
          </p>

          <div className="flex flex-wrap items-center gap-1">
            <Badge
              className={cn(
                "h-4 px-1.5 py-0 text-[10px]",
                reminder.status === "pending" &&
                  "border-amber-400/50 text-amber-400",
                reminder.status === "completed" &&
                  "border-green-400/50 text-green-400",
                reminder.status === "cancelled" &&
                  "border-rose-400/50 text-rose-400"
              )}
              variant="outline"
            >
              {reminder.status}
            </Badge>
            <Badge className="h-4 px-1.5 py-0 text-[10px]" variant="secondary">
              {reminder.type}
            </Badge>
            {reminder.repeat_pattern && (
              <Badge className="h-4 px-1.5 py-0 text-[10px]" variant="outline">
                {reminder.repeat_pattern}
              </Badge>
            )}
          </div>

          <p className="mt-2 text-muted-foreground text-xs">
            {new Date(reminder.schedule_at).toLocaleString()}
          </p>

          <Button
            className="absolute top-2 right-2 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(reminder.id);
            }}
            size="icon"
            variant="ghost"
          >
            <Trash2 className="h-3 w-3 text-rose-500" />
          </Button>

          <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-amber-500/5 via-transparent to-rose-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
        </motion.div>
      ))}
    </div>
  );
}
