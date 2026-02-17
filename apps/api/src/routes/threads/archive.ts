import { t } from "elysia";
import { threadService } from "@/config/dependencies";
import type { ApiResponse, ErrorResponse } from "@/types/api";
import type { AuthenticatedContext } from "@/types/context";
import { createErrorResponse, createSuccessResponse } from "@/utils/errors";
import { errorSchemas, simpleSuccessResponseSchema } from "@/utils/schemas";

export const archiveHandler = (
  context: AuthenticatedContext
): ApiResponse<void> | ErrorResponse => {
  const { params, set, user } = context;
  const { id } = params;

  const success = threadService.archiveConversation(id, user.id);

  if (success === false) {
    set.status = 404;
    return createErrorResponse("Thread not found", {
      code: "THREAD_NOT_FOUND",
    });
  }

  return createSuccessResponse({
    message: "Conversation archived successfully",
  });
};

export const archiveSchema = {
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
  response: {
    200: simpleSuccessResponseSchema,
    ...errorSchemas,
  },
  detail: {
    summary: "Archive a Thread",
    description: `
Archive an existing conversation thread. Archived threads are hidden from the main thread list but can still be accessed directly.

**Features:**
- **Soft Archive**: Thread remains in database but is marked as archived
- **Access Control**: Only thread owner can archive their threads
- **Reversible**: Archived threads can be unarchived (future feature)
- **Rate Limit**: 60 requests per minute for write operations

**Authentication:** Required (Session cookie)
**Rate Limit:** 30 requests per minute for write operations

**Notes:**
- Archived threads won't appear in the default thread list
- All messages within the thread remain accessible
- Archiving doesn't delete any data, only changes visibility
    `,
    tags: ["Threads"],
    examples: [
      {
        summary: "Archive a thread successfully",
        description: "Archive an existing thread by its ID",
        value: {
          id: "550e8400-e29b-41d4-a716-446655440000",
        },
      },
    ],
  },
};
