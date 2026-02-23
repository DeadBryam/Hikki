import { Elysia } from "elysia";
import { authService } from "@/config/dependencies";
import { threadEmitter } from "@/services/thread-events";
import { createSSEStream } from "./sse-helper";

export const threadsSseRoute = new Elysia({ prefix: "/threads" }).get(
  "/",
  (context) => {
    const sessionToken = context.cookie.session?.value as string;

    if (!sessionToken) {
      context.set.status = 401;
      return { error: "No session present", code: "NO_SESSION" };
    }

    const sessionData = authService.getSessionByToken(
      sessionToken,
      context.request.headers.get("user-agent") ?? undefined
    );
    if (!sessionData) {
      context.set.status = 401;
      return { error: "Invalid session", code: "INVALID_SESSION" };
    }

    const userId = sessionData.user.id;
    return createSSEStream(userId, threadEmitter, `thread:${userId}`);
  }
);
