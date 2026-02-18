import ky from "ky";
import { env } from "@/lib/utils/env";
import { toast } from "@/lib/utils/toast";
import type { ErrorResponse } from "@/types/api";
import { SESSION_TOKEN_NAME } from "../const/cookie-names";
import { getCookie, removeCookie } from "../utils/misc";

export const api = ky.create({
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
  hooks: {
    afterResponse: [
      async (_, __, response) => {
        const isAuth =
          response.url.includes("/auth/") ||
          window.location.pathname.startsWith("/auth/");

        if (response.status === 401 && !isAuth) {
          const hasSessionCookie = getCookie(SESSION_TOKEN_NAME);
          removeCookie(SESSION_TOKEN_NAME);

          if (typeof window !== "undefined") {
            if (hasSessionCookie) {
              toast.error({
                description: "Session expired. Please log in again.",
              });
            }
            window.location.assign("/auth/login");
            return;
          }
        }

        if (!response.ok) {
          const parsed = await response.json().catch(() => ({}));
          const message =
            (parsed as ErrorResponse)?.message || `Error ${response.status}`;
          toast.error({ description: message });

          const err = new Error(message) as unknown as ErrorResponse;
          try {
            err.code = (parsed as ErrorResponse)?.code;
            err.data = (parsed as ErrorResponse)?.data;
            err.details = (parsed as ErrorResponse)?.details;
          } catch {
            err.message = "An unknown error occurred";
          }
          throw err;
        }
        return response;
      },
    ],
  },
  prefixUrl: env.API_URL,
});
