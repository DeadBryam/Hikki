import { Elysia } from "elysia";
import { authService } from "@/config/dependencies";
import { memoryEmitter } from "@/services/memory-events";
import { createSSEStream } from "./sse-helper";

export const memoriesSseRoute = new Elysia({ prefix: "/memories" }).get(
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
    return createSSEStream(userId, memoryEmitter, `memory:${userId}`);
  }
);
