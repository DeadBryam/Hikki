import { t } from "elysia";
import { threadService } from "@/config/dependencies";
import type { ApiResponse, ErrorResponse } from "@/types/api";
import type { AuthenticatedContext } from "@/types/context";
import { createErrorResponse, createSuccessResponse } from "@/utils/errors";
import { errorSchemas, simpleSuccessResponseSchema } from "@/utils/schemas";

export const unarchiveHandler = (
  context: AuthenticatedContext
): ApiResponse<void> | ErrorResponse => {
  const { params, set, user } = context;
  const { id } = params;

  const success = threadService.unarchiveConversation(id, user.id);

  if (success === false) {
    set.status = 404;
    return createErrorResponse<undefined>("Thread not found", {
      code: "THREAD_NOT_FOUND",
    });
  }

  return createSuccessResponse({
    message: "Conversation unarchived successfully",
  });
};

export const unarchiveSchema = {
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
    summary: "Unarchive a Thread",
    description: `
Restore an archived conversation thread to the main thread list.

**Features:**
- **Restore Visibility**: Thread will appear in the main thread list again
- **Access Control**: Only thread owner can unarchive their threads
- **Preserves Data**: All messages and thread data remain intact

**Authentication:** Required (Session cookie)
**Rate Limit:** 30 requests per minute for write operations

**Notes:**
- Unarchived threads will appear in the default thread list immediately
- Thread ordering will be based on the updated_at timestamp
    `,
    tags: ["Threads"],
  },
};
