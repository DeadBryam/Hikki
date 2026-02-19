import { t } from "elysia";
import { PAGINATION_CONSTANTS } from "@/config/constants";
import { threadService } from "@/config/dependencies";
import type { ApiResponse, ErrorResponse } from "@/types/api";
import type { AuthenticatedContext } from "@/types/context";
import type { Message } from "@/types/llm";
import {
  generateETag,
  isNotModified,
  setETagAndCacheHeaders,
} from "@/utils/cache";
import { createErrorResponse, createSuccessResponse } from "@/utils/errors";
import { createDataResponseSchema, errorSchemas } from "@/utils/schemas";

export const messagesHandler = (
  context: AuthenticatedContext
): ApiResponse<Message[]> | ErrorResponse | undefined => {
  const { params, query, set, user } = context;
  const { id } = params;

  const limit = query.limit
    ? Number.parseInt(query.limit, 10)
    : PAGINATION_CONSTANTS.DEFAULT_LIMIT;
  const offset = query.offset
    ? Number.parseInt(query.offset, 10)
    : PAGINATION_CONSTANTS.DEFAULT_OFFSET;

  const messages = threadService.getMessages({
    threadId: id,
    userId: user.id,
    limit,
    offset,
  });

  if (messages === null || messages === undefined) {
    set.status = 404;
    return createErrorResponse<undefined>("Thread not found", {
      code: "THREAD_NOT_FOUND",
    });
  }

  if (isNotModified(context.request, generateETag(messages))) {
    set.status = 304;
    return;
  }

  setETagAndCacheHeaders(set, messages);

  return createSuccessResponse({
    data: messages,
    message: "Messages retrieved successfully",
  });
};

export const messagesSchema = {
  params: t.Object({
    id: t.String({
      format: "uuid",
      description:
        "Thread ID (UUID format) - must belong to the authenticated user",
      error: "Thread ID must be a valid UUID",
      examples: [
        "550e8400-e29b-41d4-a716-446655440000",
        "123e4567-e89b-12d3-a456-426614174000",
      ],
    }),
  }),
  query: t.Object({
    limit: t.Optional(
      t.Number({
        minimum: 1,
        maximum: 100,
        description: "Number of messages to return (1-100)",
        default: 50,
        examples: [10, 50, 100],
      })
    ),
    offset: t.Optional(
      t.Number({
        minimum: 0,
        description: "Number of messages to skip for pagination",
        default: 0,
        examples: [0, 50, 100],
      })
    ),
  }),
  response: {
    200: createDataResponseSchema(
      t.Array(
        t.Object({
          role: t.Union(
            [t.Literal("user"), t.Literal("assistant"), t.Literal("system")],
            {
              description: "Role of the message sender",
            }
          ),
          content: t.String({ description: "Message content/text" }),
          created_at: t.Optional(
            t.String({ description: "Message timestamp (ISO 8601 format)" })
          ),
        })
      )
    ),
    304: t.Undefined({
      description: "Content not modified (ETag match)",
    }),
    ...errorSchemas,
  },
  detail: {
    summary: "Get Thread Messages",
    description: `
Retrieve all messages for a specific conversation thread in chronological order.

**Features:**
- **Pagination**: Full pagination support with limit and offset
- **Chronological Order**: Messages returned in conversation order (oldest first)
- **Access Control**: Only thread owner can access messages
- **Caching**: Supports ETags for efficient caching
- **Rate Limit**: 60 requests per minute for read operations

**Authentication:** Required (Session cookie)
**Caching:** Supported with ETags
**Rate Limit:** 60 requests per minute for read operations

**Notes:**
- Messages include both user and AI responses
- System messages may be included for context
- Use pagination for threads with many messages
    `,
    tags: ["Threads"],
    examples: [
      {
        summary: "Get recent messages",
        description: "Retrieve the most recent messages from a thread",
        value: {
          id: "550e8400-e29b-41d4-a716-446655440000",
          limit: 10,
          offset: 0,
        },
      },
      {
        summary: "Paginate through messages",
        description: "Get older messages using pagination",
        value: {
          id: "550e8400-e29b-41d4-a716-446655440000",
          limit: 50,
          offset: 50,
        },
      },
    ],
  },
};
