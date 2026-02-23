import { api } from "@/lib/api/api";
import type {
  Memory,
  MemoryCreateInput,
  MemorySearchResult,
} from "@/lib/types/memory";

interface ApiResponse<T> {
  data: T;
  message: string;
}

export const memoryService = {
  async list(): Promise<ApiResponse<Memory[]>> {
    const response = await api
      .get("api/v1/memories")
      .json<ApiResponse<Memory[]>>();
    return response;
  },

  async search(query: string): Promise<MemorySearchResult[]> {
    const response = await api
      .get("api/v1/memories/search", { searchParams: { q: query } })
      .json<ApiResponse<MemorySearchResult[]>>();
    return response.data;
  },

  async create(data: MemoryCreateInput): Promise<Memory> {
    const response = await api
      .post("api/v1/memories", { json: data })
      .json<ApiResponse<Memory>>();
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`api/v1/memories/${id}`).json<ApiResponse<void>>();
  },
};
