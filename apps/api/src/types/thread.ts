export interface Thread {
  created_at: string | null;
  deleted_at: string | null;
  id: string;
  message_count: number | null;
  title: string;
  updated_at: string | null;
  user_id: string;
}

export interface Message {
  content: string;
  created_at: string;
  id: string;
  role: "user" | "assistant";
  service?: string;
  summarized: boolean;
  thread_id: string;
}

export interface Summary {
  created_at: string;
  id: string;
  summary: string;
  thread_id: string;
  updated_at: string;
}

export interface MemoryItem {
  content: string;
  created_at: string;
  deleted_at?: string;
  id: string;
  thread_id?: string;
  type: "fact" | "personality" | "event" | "other";
  updated_at: string;
}
