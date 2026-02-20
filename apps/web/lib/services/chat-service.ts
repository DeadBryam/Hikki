import type { KyResponse } from "ky";
import { api } from "@/lib/api/api";

export interface SendMessageParams {
  model?: string;
  question: string;
  stream?: boolean;
  thread?: string;
}

export interface SendMessageResponse {
  messageId: string;
  model: string;
  stream: ReadableStream<string>;
  threadId: string;
}

interface StreamController {
  close: () => void;
  enqueue: (chunk: string) => void;
  error: (error: unknown) => void;
}

function processBuffer(buffer: string, ctrl: StreamController): string {
  let remaining = buffer;
  while (remaining.includes("\n")) {
    const newlineIndex = remaining.indexOf("\n");
    const chunk = remaining.slice(0, newlineIndex);
    remaining = remaining.slice(newlineIndex + 1);
    if (chunk.trim()) {
      ctrl.enqueue(chunk);
    }
  }
  return remaining;
}

async function readStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  controller: StreamController
): Promise<void> {
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        if (buffer.trim()) {
          controller.enqueue(buffer);
        }
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      buffer = processBuffer(buffer, controller);
    }
  } finally {
    reader.releaseLock();
  }
}

export const chatService = {
  sendMessage(params: SendMessageParams): Promise<SendMessageResponse> {
    const { question, thread, model, stream = true } = params;

    let threadId = "";
    let messageId = "";
    let modelUsed = "";

    const readableStream = new ReadableStream<string>({
      async start(controller) {
        try {
          const response: KyResponse = await api.post("api/v1/chat", {
            json: { question, thread, model, stream },
            headers: thread ? { "X-Thread-ID": thread } : {},
          });

          threadId = response.headers.get("X-Thread-ID") || thread || "";
          messageId = response.headers.get("X-Message-ID") || "";
          modelUsed = response.headers.get("X-Model") || "";

          const reader = response.body?.getReader();
          if (!reader) {
            controller.error(new Error("Response body is null"));
            return;
          }

          await readStream(reader, controller);
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return Promise.resolve({
      stream: readableStream,
      threadId,
      messageId,
      model: modelUsed,
    });
  },
};
