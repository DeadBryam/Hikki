import type { ThreadResponse } from "@/types/threads";

export const groupThreadsByDate = (conversations: ThreadResponse[]) => {
  const groups: { [key: string]: ThreadResponse[] } = {
    Pinned: [],
    Today: [],
    Yesterday: [],
    "Last 7 days": [],
    "Last 30 days": [],
    Older: [],
  };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86_400_000);
  const last7Days = new Date(today.getTime() - 7 * 86_400_000);
  const last30Days = new Date(today.getTime() - 30 * 86_400_000);

  for (const conv of conversations) {
    const convDate = new Date(conv.created_at);

    if (conv.is_pinned) {
      groups.Pinned.push(conv);
    } else if (convDate >= today) {
      groups.Today.push(conv);
    } else if (convDate >= yesterday) {
      groups.Yesterday.push(conv);
    } else if (convDate >= last7Days) {
      groups["Last 7 days"].push(conv);
    } else if (convDate >= last30Days) {
      groups["Last 30 days"].push(conv);
    } else {
      groups.Older.push(conv);
    }
  }

  return Object.entries(groups).filter(([_, items]) => items.length > 0);
};
