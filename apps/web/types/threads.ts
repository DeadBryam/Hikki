import type { PaginationResponse } from "./pagination";

export interface ThreadResponse {
  archived_at?: string;
  created_at: string;
  deleted_at?: string;
  id: string;
  is_pinned?: boolean;
  messages_count?: number;
  title: string;
  updated_at: string;
}

export interface PaginatedThreadsResponse {
  items: ThreadResponse[];
  pagination: PaginationResponse;
}

export interface ListThreadsParams {
  archived?: boolean;
  limit?: number;
  offset?: number;
  order?: "asc" | "desc";
  search?: string;
  sort?: "created_at" | "updated_at" | "title";
}

export interface CreateThreadResponse {
  created_at: string;
  id: string;
  title: string;
  updated_at: string;
}
