import ky from "ky";
import { env } from "@/lib/env";
import { toast } from "@/lib/toast";

export const api = ky.create({
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
  hooks: {
    afterResponse: [
      async (_, __, response) => {
        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          const message =
            (error as ApiError)?.message || `Error ${response.status}`;
          toast.error({ description: message });
          throw new Error(message);
        }
        return response;
      },
    ],
  },
  prefixUrl: env.API_URL,
});

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  code?: string;
  details?: Record<string, string[]>;
  message: string;
}
