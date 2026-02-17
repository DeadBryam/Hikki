import ky from "ky";

import { toast } from "@/lib/toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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
          toast.error(message);
          throw new Error(message);
        }
        return response;
      },
    ],
    beforeRequest: [
      (request) => {
        console.log(`[API] ${request.method} ${request.url}`);
      },
    ],
  },
  prefixUrl: API_URL,
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
