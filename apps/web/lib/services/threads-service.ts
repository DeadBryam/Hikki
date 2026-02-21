import { api } from "@/lib/api/api";
import type { ApiResponse } from "@/types/api";
import type {
  CreateThreadResponse,
  ListThreadsParams,
  PaginatedThreadsResponse,
} from "@/types/threads";

export const threadsService = {
  async list(
    params?: ListThreadsParams
  ): Promise<ApiResponse<PaginatedThreadsResponse>> {
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

  async archive(id: string): Promise<ApiResponse<CreateThreadResponse>> {
    const response = await api.post(`api/v1/threads/${id}/archive`);
    return response.json();
  },
};
