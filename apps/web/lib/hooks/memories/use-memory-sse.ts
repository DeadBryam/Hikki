import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { env } from "@/lib/utils/env";

const SSE_ENDPOINT = `${env.API_URL}/api/v1/sse/memories`;

interface MemoryEvent {
  memoryId?: string;
  timestamp?: string;
  type: "connected" | "created" | "deleted" | "ping";
  userId?: string;
}

export function useMemorySSE() {
  const queryClient = useQueryClient();

  const handleEvent = useCallback(
    (event: MemoryEvent) => {
      if (event.type === "created" || event.type === "deleted") {
        queryClient.invalidateQueries({ queryKey: ["memories"] });
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
        const event = JSON.parse(e.data) as MemoryEvent;
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
