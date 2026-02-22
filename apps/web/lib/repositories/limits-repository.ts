import { api } from "@/lib/api/api";

export interface Limits {
  maxMessageLength: number;
  maxMessages: number;
}

export async function getLimits(): Promise<Limits> {
  const response = await api.get("api/v1/limits").json<{
    data: Limits;
  }>();
  return response.data;
}
