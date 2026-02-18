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
          const parsed = await response.json().catch(() => ({}));
          const message =
            (parsed as ApiError)?.message || `Error ${response.status}`;
          toast.error({ description: message });

          const err = new Error(message) as Error &
            Partial<ApiError> & { parsed?: any };
          try {
            err.code = (parsed as ApiError)?.code;
            err.details = (parsed as ApiError)?.details;
          } catch {
            err.message = "An unknown error occurred";
          }
          err.parsed = parsed;
          throw err;
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
  details?: Record<string, string>[];
  message: string;
}
