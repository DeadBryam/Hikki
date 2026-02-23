"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cardHoverVariants } from "@/lib/utils/animations";
import { cn } from "@/lib/utils/misc";

interface Reminder {
  completed: boolean;
  dueDate: string;
  id: string;
  priority: "high" | "medium" | "low";
  text: string;
}

interface RemindersTabProps {
  reminders: Reminder[];
}

export function RemindersTab({ reminders }: RemindersTabProps) {
  if (reminders.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground text-sm">
        <CheckCircle2 className="mx-auto mb-2 h-8 w-8 opacity-50" />
        <p>No tasks</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {reminders.map((reminder) => (
        <motion.div
          className={cn(
            "group relative flex cursor-pointer items-start gap-3 overflow-hidden rounded-xl border border-border/50 bg-card p-3",
            reminder.completed && "opacity-60"
          )}
          initial="rest"
          key={reminder.id}
          variants={cardHoverVariants}
          whileHover="hover"
        >
          <div
            className={cn(
              "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
              reminder.completed
                ? "border-primary bg-primary"
                : "border-muted-foreground/30 hover:border-primary"
            )}
          >
            {reminder.completed && (
              <CheckCircle2 className="h-3 w-3 text-white" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "text-sm",
                reminder.completed && "text-muted-foreground line-through"
              )}
            >
              {reminder.text}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <Badge
                className={cn(
                  "h-4 px-1.5 py-0 text-[10px]",
                  reminder.priority === "high" &&
                    "border-rose-400/50 text-rose-400",
                  reminder.priority === "medium" &&
                    "border-amber-400/50 text-amber-400",
                  reminder.priority === "low" &&
                    "border-green-400/50 text-green-400"
                )}
                variant="outline"
              >
                {reminder.priority}
              </Badge>
              <span className="text-muted-foreground text-xs">
                {new Date(reminder.dueDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
