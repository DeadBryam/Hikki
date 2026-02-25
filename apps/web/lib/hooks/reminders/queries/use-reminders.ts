import { useQuery } from "@tanstack/react-query";
import { reminderService } from "@/lib/services/reminder-service";

export const REMINDERS_KEY = ["reminders"];

export function useReminders() {
  return useQuery({
    queryKey: REMINDERS_KEY,
    queryFn: () => reminderService.list(),
  });
}
