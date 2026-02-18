import ky from "ky";
import { env } from "@/lib/env";
import { toast } from "@/lib/toast";
import type { ApiError } from "@/types/api";
import { SESSION_TOKEN_NAME } from "./const/cookie-names";
import { getCookie, removeCookie } from "./utils";

export const api = ky.create({
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
  hooks: {
    afterResponse: [
      async (_, __, response) => {
        if (response.status === 401) {
          const hasSessionCookie = getCookie(SESSION_TOKEN_NAME);
          removeCookie(SESSION_TOKEN_NAME);

          if (typeof window !== "undefined") {
            if (window.location.pathname.startsWith("/auth/")) {
              if (hasSessionCookie) {
                toast.error({
                  description: "Session expired. Please log in again.",
                });
              }
              return;
            }
            window.location.assign("/auth/login");
          }
        }

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
