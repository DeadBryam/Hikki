import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { env } from "@/lib/utils/env";

const SSE_ENDPOINT = `${env.API_URL}/api/v1/sse/threads`;

interface ThreadEvent {
  threadId?: string;
  timestamp?: string;
  type: "connected" | "created" | "deleted" | "updated" | "ping";
  userId?: string;
}

export function useThreadSSE() {
  const queryClient = useQueryClient();

  const handleEvent = useCallback(
    (event: ThreadEvent) => {
      if (
        event.type === "created" ||
        event.type === "deleted" ||
        event.type === "updated"
      ) {
        queryClient.invalidateQueries({ queryKey: ["threads"] });
      }
    },
    [queryClient]
  );

  useEffect(() => {
    const eventSource = new EventSource(SSE_ENDPOINT, {
      withCredentials: true,
    });

    eventSource.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data) as ThreadEvent;
        handleEvent(event);
      } catch (err) {
        console.error("Failed to parse SSE event:", err);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [handleEvent]);
}
