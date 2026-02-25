import { api } from "@/lib/api/api";

export interface Reminder {
  channel: "all" | "in-app" | "email" | "push";
  created_at: string;
  id: string;
  message: string;
  repeat_pattern: string | null;
  schedule_at: string;
  status: "pending" | "completed" | "cancelled";
  type: "one-time" | "recurrent";
}

interface ApiResponse<T> {
  data: T;
  message: string;
}

export const reminderService = {
  async list(): Promise<ApiResponse<Reminder[]>> {
    const response = await api
      .get("api/v1/reminders")
      .json<ApiResponse<Reminder[]>>();
    return response;
  },

  async create(data: {
    message: string;
    type: "one-time" | "recurrent";
    schedule_at: string;
    repeat_pattern?: string;
    channel: "all" | "in-app" | "email" | "push";
  }): Promise<Reminder> {
    const response = await api
      .post("api/v1/reminders", { json: data })
      .json<ApiResponse<Reminder>>();
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`api/v1/reminders/${id}`).json<ApiResponse<void>>();
  },
};
