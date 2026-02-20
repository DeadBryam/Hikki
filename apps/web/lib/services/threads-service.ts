import { api } from "@/lib/api/api";
import type { ApiResponse } from "@/types/api";

export interface Thread {
  archived_at?: string;
  created_at: string;
  deleted_at?: string;
  id: string;
  is_pinned?: boolean;
  messages_count?: number;
  title: string;
  updated_at: string;
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

export const threadsService = {
  async list(params?: ListThreadsParams): Promise<ApiResponse<Thread[]>> {
    const searchParams = new URLSearchParams();
    if (params?.limit) {
      searchParams.set("limit", String(params.limit));
    }
    if (params?.offset) {
      searchParams.set("offset", String(params.offset));
    }
    if (params?.search) {
      searchParams.set("search", params.search);
    }
    if (params?.archived !== undefined) {
      searchParams.set("archived", String(params.archived));
    }
    if (params?.sort) {
      searchParams.set("sort", params.sort);
    }
    if (params?.order) {
      searchParams.set("order", params.order);
    }

    const query = searchParams.toString();
    const response = await api.get(`api/v1/threads${query ? `?${query}` : ""}`);
    return response.json();
  },

  async create(title?: string): Promise<ApiResponse<CreateThreadResponse>> {
    const response = await api.post("api/v1/threads", {
      json: title ? { title } : {},
    });
    return response.json();
  },

  async delete(id: string): Promise<ApiResponse<{ success: boolean }>> {
    const response = await api.delete(`api/v1/threads/${id}`);
    return response.json();
  },

  async archive(id: string): Promise<ApiResponse<Thread>> {
    const response = await api.post(`api/v1/threads/${id}/archive`);
    return response.json();
  },
};
