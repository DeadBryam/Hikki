import { t } from "elysia";
import { CHAT_CONSTANTS } from "@/config/constants";
import {
  memoryRepository,
  threadRepository,
  threadService,
} from "@/config/dependencies";
import { createLLMService } from "@/services/api/llm";
import { createMemoryService } from "@/services/llm-tools";
import type { AuthenticatedContext } from "@/types/context";
import type { ChatRequest } from "@/types/llm";
import { createErrorResponse } from "@/utils/errors";

const { MAX_MESSAGE_LENGTH, MAX_MESSAGES_PER_CONVERSATION } = CHAT_CONSTANTS;

export async function* chatHandler(params: AuthenticatedContext<ChatRequest>) {
  const { body, logestic, user, set, requestId } = params;
  const { question, stream = true, thread: providedThread, model } = body;

  if (question.length > MAX_MESSAGE_LENGTH) {
    set.status = 400;
    yield createErrorResponse(
      `Message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters`,
      {
        code: "MESSAGE_TOO_LONG",
      }
    );
    return;
  }

  const userId = user.id;
  const thread = providedThread || crypto.randomUUID();
  const messageId = crypto.randomUUID();

  if (providedThread) {
    const existingThread = threadRepository.findById(providedThread);
    if (existingThread && existingThread.user_id !== userId) {
      set.status = 403;
      yield createErrorResponse("Access denied", {
        code: "THREAD_ACCESS_DENIED",
      });
      return;
    }
  }

  const { service, name } = createLLMService();
  const memoryServiceInstance = createMemoryService(memoryRepository, userId);

  logestic?.info(`[${requestId}] [${name}] selected for thread. ID: ${thread}`);

  const messages = threadService.getThreadMessages(thread, userId);

  if (messages.length >= MAX_MESSAGES_PER_CONVERSATION) {
    set.status = 400;
    yield createErrorResponse(
      `Conversation has reached the maximum limit of ${MAX_MESSAGES_PER_CONVERSATION} messages`,
      {
        code: "CONVERSATION_LIMIT_REACHED",
      }
    );
    return;
  }

  messages.push({ role: "user", content: question });
  threadService.storeUserMessageInThread(thread, question, name);

  logestic?.info(
    `[${name}] Received question for thread ID: ${thread} with ${messages.length} messages so far.`
  );

  const result = service.chat({
    messages,
    stream,
    model,
    memoryService: memoryServiceInstance,
  });

  set.headers["Content-Type"] = "text/plain; charset=utf-8";
  set.headers["X-Thread-ID"] = thread;
  set.headers["X-Message-ID"] = messageId;
  set.headers["X-Model"] = model || service.model;

  let response = "";

  try {
    for await (const chunk of result) {
      response += chunk;
      yield chunk;
    }
  } catch (error) {
    const errorMsg = `[Error from ${name}]: ${(error as Error).message}`;
    logestic?.error(
      `[${requestId}] [${name}] Streaming error: ${(error as Error).message}`
    );
    response += errorMsg;
    yield errorMsg;
  } finally {
    threadService.storeAssistantResponseInThread(thread, response, name);
    logestic?.info(`[${name}] Thread updated. ID: ${thread}`);
  }
}

export const chatSchema = {
  body: t.Object({
    question: t.String({
      minLength: 1,
      maxLength: MAX_MESSAGE_LENGTH,
      description: `The question or message to send to the AI assistant (max ${MAX_MESSAGE_LENGTH} characters)`,
      examples: [
        "Hello, how are you?",
        "Explain quantum computing in simple terms",
        "Write a Python function to calculate fibonacci numbers",
      ],
    }),
    thread: t.Optional(
      t.String({
        description:
          "Thread ID to continue an existing conversation. If omitted, a new thread will be created.",
        format: "uuid",
        examples: ["550e8400-e29b-41d4-a716-446655440000"],
      })
    ),
    stream: t.Optional(
      t.Boolean({
        description:
          "Whether to stream the response in real-time. Defaults to true.",
        default: true,
        examples: [true, false],
      })
    ),
    model: t.Optional(
      t.String({
        description:
          "Specific AI model to use for this request. If omitted, uses the default model.",
        examples: ["gpt-4", "gpt-3.5-turbo"],
      })
    ),
  }),
  response: t.Union([
    t.String({
      description:
        "The AI assistant's response. When streaming=true, this will be streamed in chunks.",
    }),
    t.Object({
      success: t.Boolean({ description: "Whether the request was successful" }),
      message: t.String({ description: "Error or success message" }),
      code: t.Optional(t.String({ description: "Error code" })),
      details: t.Optional(t.Array(t.String())),
      data: t.Optional(t.Any()),
      timestamp: t.String({ description: "ISO timestamp" }),
    }),
  ]),
  detail: {
    tags: ["Chat"],
    description: `
Send a message to the AI assistant and receive a response.

**Features:**
- **Thread Support**: Continue conversations by providing a thread ID
- **Streaming**: Real-time response streaming for better UX
- **Model Selection**: Choose specific AI models when available
- **Rate Limit**: 20 requests per minute for write operations

**Response Headers:**
- \`X-Thread-ID\`: Unique thread identifier
- \`X-Message-ID\`: Unique message identifier
- \`X-Model\`: AI model used for the response
- \`X-RateLimit-*\`: Rate limiting information

**Authentication:** Required (Session cookie)
    `,
    summary: "Send message to AI assistant",
    examples: [
      {
        summary: "Simple chat message",
        description: "Send a basic message to start a new conversation",
        value: {
          question: "What is the capital of France?",
          stream: true,
        },
      },
      {
        summary: "Continue existing thread",
        description: "Continue a conversation with an existing thread",
        value: {
          question: "Can you elaborate on that answer?",
          thread: "550e8400-e29b-41d4-a716-446655440000",
          stream: true,
        },
      },
      {
        summary: "Non-streaming response",
        description: "Get a complete response without streaming",
        value: {
          question: "Write a haiku about programming",
          stream: false,
          model: "gpt-4",
        },
      },
    ],
  },
};
