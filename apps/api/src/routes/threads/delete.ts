import { t } from "elysia";
import { threadService } from "@/config/dependencies";
import type { ApiResponse, ErrorResponse } from "@/types/api";
import type { AuthenticatedContext } from "@/types/context";
import { createErrorResponse, createSuccessResponse } from "@/utils/errors";
import { errorSchemas, simpleSuccessResponseSchema } from "@/utils/schemas";

export const deleteHandler = (
  context: AuthenticatedContext
): ApiResponse<void> | ErrorResponse => {
  const { params, set, user } = context;
  const { id } = params;

  const success = threadService.deleteConversation(id, user.id);

  if (success === false) {
    set.status = 404;
    return createErrorResponse<undefined>("Thread not found", {
      code: "THREAD_NOT_FOUND",
    });
  }

  return createSuccessResponse({
    message: "Thread deleted",
  });
};

export const deleteSchema = {
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
    summary: "Delete a Thread",
    description: `
Delete a conversation thread. This performs a soft delete by marking the thread as deleted.

**Features:**
- **Soft Delete**: Thread is marked as deleted but remains in database
- **Access Control**: Only thread owner can delete their threads
- **Rate Limit**: 30 requests per minute for write operations

**Authentication:** Required (Session cookie)
**Rate Limit:** 30 requests per minute for write operations

**Notes:**
- Deleted threads won't appear in the thread list
- All messages within the thread remain in the database
    `,
    tags: ["Threads"],
    examples: [
      {
        summary: "Delete a thread successfully",
        description: "Delete an existing thread by its ID",
        value: {
          id: "550e8400-e29b-41d4-a716-446655440000",
        },
      },
    ],
  },
};
