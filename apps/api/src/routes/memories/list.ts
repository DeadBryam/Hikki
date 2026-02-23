import { t } from "elysia";
import { memoryService } from "@/config/dependencies";
import type { ApiResponse, ErrorResponse } from "@/types/api";
import type { AuthenticatedContext } from "@/types/context";
import { createErrorResponse, createSuccessResponse } from "@/utils/errors";
import { createDataResponseSchema, errorSchemas } from "@/utils/schemas";

export const listHandler = (
  context: AuthenticatedContext
):
  | ApiResponse<
      Array<{
        id: string;
        type: string;
        content: string;
        thread_id: string | null;
        created_at: string;
      }>
    >
  | ErrorResponse => {
  const { query, user } = context;
  const { q } = query;

  try {
    const memories = memoryService.getMemories(user.id, q);

    return createSuccessResponse({
      data: memories.map((memory) => ({
        id: memory.id,
        type: memory.type,
        content: memory.content,
        thread_id: memory.thread_id,
        created_at: memory.created_at || "",
      })),
      message: "Memories retrieved successfully",
    });
  } catch (error) {
    return createErrorResponse<undefined>((error as Error).message, {
      code: "LIST_MEMORIES_FAILED",
    });
  }
};

export const listSchema = {
  query: t.Object({
    q: t.Optional(
      t.String({
        minLength: 1,
        maxLength: 100,
        description: "Search query to filter memories",
        examples: ["prefers", "dark mode", "name is"],
      })
    ),
  }),
  response: {
    200: createDataResponseSchema(
      t.Array(
        t.Object({
          id: t.String({
            format: "uuid",
            description: "Memory unique identifier",
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
      )
    ),
    ...errorSchemas,
  },
  detail: {
    summary: "List Memories",
    description: `
Retrieve a list of memories for the authenticated user.

**Features:**
- **Search**: Optional query parameter to search memories
- **Rate Limit**: 60 requests per minute for read operations

**Authentication:** Required (Session cookie)
**Rate Limit:** 60 requests per minute for read operations
    `,
    tags: ["Memories"],
    examples: [
      {
        summary: "List all memories",
        description: "Get all memories for the user",
        value: {},
      },
      {
        summary: "Search memories",
        description: "Find memories containing specific keywords",
        value: {
          q: "prefers dark",
        },
      },
    ],
  },
};
