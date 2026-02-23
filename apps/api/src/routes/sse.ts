import { Elysia } from "elysia";
import { authService } from "@/config/dependencies";
import { memoryEmitter } from "@/services/memory-events";

export const sseRoutes = new Elysia({ prefix: "/sse" }).get(
  "/memories",
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

    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        let isClosed = false;

        const sendEvent = (data: object) => {
          if (isClosed) {
            return;
          }
          try {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
            );
          } catch {
            // Controller closed, mark as closed
            isClosed = true;
          }
        };

        const onMemoryEvent = (event: object) => {
          sendEvent(event);
        };

        memoryEmitter.on(`memory:${userId}`, onMemoryEvent);

        sendEvent({ type: "connected", userId });

        const heartbeat = setInterval(() => {
          sendEvent({
            type: "ping",
            timestamp: new Date().toISOString(),
          });
        }, 30_000);

        // Clean up on close
        return () => {
          isClosed = true;
          clearInterval(heartbeat);
          memoryEmitter.off(`memory:${userId}`, onMemoryEvent);
        };
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }
);
