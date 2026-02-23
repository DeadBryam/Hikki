import { t } from "elysia";
import { memoryService } from "@/config/dependencies";
import type { ApiResponse, ErrorResponse } from "@/types/api";
import type { AuthenticatedContext } from "@/types/context";
import { createErrorResponse, createSuccessResponse } from "@/utils/errors";
import { createDataResponseSchema, errorSchemas } from "@/utils/schemas";

interface CreateMemoryBody {
  content: string;
  threadId?: string;
  type: "fact" | "personality" | "event" | "other";
}

export const createHandler = (
  context: AuthenticatedContext<CreateMemoryBody>
):
  | ApiResponse<{
      id: string;
      type: string;
      content: string;
      thread_id: string | null;
      created_at: string;
    }>
  | ErrorResponse => {
  const { body, user } = context;
  const { content, type, threadId } = body;

  try {
    const memory = memoryService.createMemory(user.id, content, type, threadId);

    return createSuccessResponse({
      data: {
        id: memory.id,
        type: memory.type,
        content: memory.content,
        thread_id: memory.thread_id,
        created_at: memory.created_at || "",
      },
      message: "Memory created successfully",
    });
  } catch (error) {
    return createErrorResponse<undefined>((error as Error).message, {
      code: "CREATE_MEMORY_FAILED",
    });
  }
};

export const createSchema = {
  body: t.Object({
    content: t.String({
      minLength: 1,
      maxLength: 5000,
      description: "The memory content to store",
      examples: ["User prefers dark mode", "User's name is John"],
    }),
    type: t.Union(
      [
        t.Literal("fact"),
        t.Literal("personality"),
        t.Literal("event"),
        t.Literal("other"),
      ],
      {
        description: "Type of memory",
        examples: ["fact", "personality", "event", "other"],
      }
    ),
    threadId: t.Optional(
      t.String({
        format: "uuid",
        description: "Optional thread ID to associate this memory with",
        examples: ["550e8400-e29b-41d4-a716-446655440000"],
      })
    ),
  }),
  response: {
    200: createDataResponseSchema(
      t.Object({
        id: t.String({
          format: "uuid",
          description: "Unique identifier for the created memory",
        }),
        type: t.String({
          description: "Type of memory",
        }),
        content: t.String({
          description: "Memory content",
        }),
        thread_id: t.Union([t.String({ format: "uuid" }), t.Null()], {
          description: "Associated thread ID (null if none)",
        }),
        created_at: t.String({
          description: "Creation timestamp",
        }),
      })
    ),
    ...errorSchemas,
  },
  detail: {
    summary: "Create a Memory",
    description: `
Create a new memory item for the authenticated user.

**Features:**
- **Types**: fact, personality, event, or other
- **Optional Thread**: Associate memory with a specific thread
- **Rate Limit**: 30 requests per minute for write operations

**Authentication:** Required (Session cookie)
**Rate Limit:** 30 requests per minute for write operations
    `,
    tags: ["Memories"],
    examples: [
      {
        summary: "Create a fact memory",
        description: "Store a factual memory about the user",
        value: {
          content: "User prefers dark mode",
          type: "fact",
        },
      },
      {
        summary: "Create a personality memory",
        description: "Store a personality trait",
        value: {
          content: "User is very detail-oriented",
          type: "personality",
        },
      },
    ],
  },
};
