const createSSEStream = (userId: string, emitter: any, channel: string) => {
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
          isClosed = true;
        }
      };

      const onEvent = (event: object) => {
        sendEvent(event);
      };

      emitter.on(channel, onEvent);

      sendEvent({ type: "connected", userId });

      const heartbeat = setInterval(() => {
        sendEvent({
          type: "ping",
          timestamp: new Date().toISOString(),
        });
      }, 30_000);

      return () => {
        isClosed = true;
        clearInterval(heartbeat);
        emitter.off(channel, onEvent);
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
};

export { createSSEStream };
