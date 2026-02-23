export interface Memory {
  content: string;
  created_at: string;
  id: string;
  thread_id: string | null;
  type: "fact" | "personality" | "event" | "other";
  updated_at: string;
}

export interface MemoryCreateInput {
  content: string;
  tags?: string[];
  type?: "fact" | "personality" | "event" | "other";
}

export interface MemorySearchResult {
  content: string;
  created_at: string;
  id: string;
  rank?: number;
  thread_id: string | null;
  type: "fact" | "personality" | "event" | "other";
  updated_at: string;
}
